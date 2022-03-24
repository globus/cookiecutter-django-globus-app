from {{ cookiecutter.project_slug }}.mixins import HelperPageMixin, SliderFacetsMixin
from {{ cookiecutter.project_slug }}.generic_views import SearchView

from django.contrib import messages
from django.shortcuts import render
from django.urls import reverse

from globus_portal_framework.gclients import load_transfer_client

from urllib.parse import urlsplit, urlparse

import globus_sdk
import humanize
import logging
import os

log = logging.getLogger(__name__)


def landing_page(request):

    context = {}
    return render(request, "globus-portal-framework/v2/landing-page.html", context)


class CustomSearch(SliderFacetsMixin, SearchView):
    """Search with Slider Facets enabled."""

    pass


class SearchTransferView(SearchView, HelperPageMixin):
    MAX_SEARCH_LIMIT = 1000
    transfer_params = {
        "label": None,
        "submission_id": None,
        "sync_level": "checksum",
        "verify_checksum": False,
        "preserve_timestamp": False,
        "encrypt_data": True,
        "deadline": None,
        "recursive_symlinks": "ignore",
    }

    def get_redirect_url(self):
        return reverse("search-transfer", kwargs={"index": self.kwargs["index"]})

    def post_search(self, client, index_uuid, search_client_data):
        search_client_data.pop("facets")  # Facets are not needed.
        search_client_data["limit"] = self.MAX_SEARCH_LIMIT
        return client.post_search(index_uuid, search_client_data)

    def process_result(self, index_info, search_result):
        """
        Process the result from Globus Search into data ready to be rendered
        into search templates.
        """
        context = super().process_result(index_info, search_result)
        file_list = [r["content"][0]["files"][0] for r in search_result.data["gmeta"]]
        urls = [urlsplit(r["url"]) for r in file_list]

        context["transfer_source"] = {
            "endpoint": urls[0].netloc,
            "paths": [u.path for u in urls],
            "total_size_humanized": humanize.naturalsize(
                sum(int(r["length"]) for r in file_list)
            ),
            "results": len(urls),
        }
        return context

    def get(self, *args, index=None, **kwargs):
        context = {
            "helper_page_transfer_url": self.get_helper_page_url(),
            "transfer_destination": self.request.session.get("transfer_destination"),
        }
        # If the user queried the globus helper page, it will populate
        # with query params from the helper page redirect.
        if self.request.GET.get("q"):
            context.update(super().get_context_data(index))
            self.request.session["transfer_source"] = context["transfer_source"]
            log.debug(f"Fetching search information, saving to session...")
            log.debug(
                f'Saved {len(context["transfer_source"]["paths"])} items for transfer.'
            )
        elif self.request.GET:
            log.debug("Globus Helper page context detected, saving to session...")
            context["transfer_destination"] = self.request.GET
            self.request.session["transfer_destination"] = self.request.GET
        return render(self.request, "globus-portal-framework/v2/search-transfer.html", context)

    def post(self, *args, **kwargs):
        context = {}
        try:
            required = {"endpoint", "path", "label"}
            user_unspecified = {r for r in required if not self.request.POST.get(r)}
            if user_unspecified:
                raise ValueError(f"Please provide these values: {user_unspecified}")

            transfer_items = self.request.session.get("transfer_source", {})
            transfer_required = {"endpoint", "paths"}
            unspecified_t = [r for r in transfer_required if not transfer_items.get(r)]
            if unspecified_t:
                raise ValueError(
                    f"Something went wrong gathering the source files. "
                    f"Please try your search again."
                )

            tc = load_transfer_client(self.request.user)
            params = self.transfer_params.copy()
            params["label"] = self.request.POST["label"]
            destination_ep = self.request.POST["endpoint"]
            destination_path = self.request.POST["path"]
            td = globus_sdk.TransferData(
                tc, transfer_items["endpoint"], destination_ep, **params
            )
            log.debug(
                f'Transferring data from {transfer_items["endpoint"]} to '
                f"{destination_ep}"
            )
            for item in transfer_items["paths"]:
                dest = os.path.join(destination_path, item.lstrip("/"))
                log.debug(
                    f"User {self.request.user} submitted detail transfer "
                    f"{item} to {dest}"
                )
                td.add_item(item, dest, False)

            result = tc.submit_transfer(td)
            task_id = result.data["task_id"]
            context["transfer_task"] = task_id
            context[
                "transfer_url"
            ] = f"https://app.globus.org/activity/{task_id}/overview"
        except Exception as e:
            log.debug(
                f"Error starting transfer for user {self.request.user}", exc_info=True
            )
            messages.error(self.request, str(e))

        return render(self.request, "globus-portal-framework/v2/search-transfer.html", context)
