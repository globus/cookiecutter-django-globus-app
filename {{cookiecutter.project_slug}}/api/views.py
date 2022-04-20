from api.serializers import UserSerializer

from django.conf import settings
from django.shortcuts import redirect

from functools import wraps

from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response

import globus_sdk
import requests


def globus_authentication(function):
    @wraps(function)
    def wrapper(view_func, request, *args, **kwargs):
        if request.user.is_authenticated:
            user = request.user.social_auth.get(user=request.user)
            transfer = next(
                (
                    token
                    for token in user.extra_data["other_tokens"]
                    if token["scope"]
                    == "urn:globus:auth:scope:transfer.api.globus.org:all"
                ),
                None,
            )

            token_type = user.extra_data["token_type"]
            transfer_token = transfer["access_token"]
            transfer_auth_header = {"Authorization": f"{token_type} {transfer_token}"}

            request.session["transfer_auth_header"] = transfer_auth_header
            request.session["transfer_token"] = transfer_token
        else:
            return redirect("/login/globus")

        return function(view_func, request, *args, **kwargs)

    return wrapper


# Below method is not currently implemented anywhere. Keeping for future reference.
# The idea would be to set the a session key to the value of the transfer auth header
# and use in subsequent views.
@api_view(["GET"])
def authorize(request):
    if request.user.is_authenticated:
        user = request.user.social_auth.get(user=request.user)
        transfer = next(
            (
                token
                for token in user.extra_data["other_tokens"]
                if token["scope"] == "urn:globus:auth:scope:transfer.api.globus.org:all"
            ),
            None,
        )

        # Would eventually like to refactor and add to session for easy access in views
        token_type = user.extra_data["token_type"]
        transfer_token = transfer["access_token"]
        transfer_auth_header = {"Authorization": f"{token_type} {transfer_token}"}
        request.session["transfer_auth_header"] = transfer_auth_header

        if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
            # If the request is AJAX, return relevant current user information as JSON
            serializer = UserSerializer(request.user)
            return Response(serializer.data)

        return redirect("/")
    return redirect("/login/globus/")


class EndpointSearchView(viewsets.ViewSet):
    TRANSFER_BASE_URL = "https://transfer.api.globusonline.org/v0.10"

    @globus_authentication
    def list(self, request, *args, **kwargs):
        filter_fulltext = request.query_params.get("filter_fulltext", "my-endpoints")
        search_url = f"{self.TRANSFER_BASE_URL}/endpoint_search?filter_fulltext={filter_fulltext}"
        response = requests.get(
            search_url,
            headers=request.session["transfer_auth_header"],
        )
        return Response(response.json()["DATA"])

    @globus_authentication
    def retrieve(self, request, pk=settings.PORTAL_ENDPOINT_ID, *args, **kwargs):
        endpoint_url = f"{self.TRANSFER_BASE_URL}/endpoint/{pk}"
        response = requests.get(
            endpoint_url,
            headers=request.session["transfer_auth_header"],
        )

        if response.ok:
            return Response(response.json(), response.status_code)
        return Response(
            {"status_code": response.status_code, **response.json()},
            response.status_code,
        )

    @action(detail=True)
    @globus_authentication
    def ls(self, request, pk=settings.PORTAL_ENDPOINT_ID, *args, **kwargs):
        endpoint_url = f"{self.TRANSFER_BASE_URL}/endpoint/{pk}/ls?show_hidden=0"
        path = request.query_params.get("path", None)
        if path:
            endpoint_url = f"{endpoint_url}&path={path}"

        response = requests.get(
            endpoint_url,
            headers=request.session["transfer_auth_header"],
        )

        if response.ok:
            return Response(response.json(), response.status_code)
        return Response(
            {"status_code": response.status_code, **response.json()},
            response.status_code,
        )

    @action(detail=False, methods=["POST"])
    @globus_authentication
    def transfer(self, request, *args, **kwargs):
        transfer_client = globus_sdk.TransferClient(
            authorizer=globus_sdk.AccessTokenAuthorizer(
                request.session["transfer_token"]
            )
        )

        transfer_request_payload = request.data
        transfer_data = globus_sdk.TransferData(
            transfer_client,
            transfer_request_payload["source_endpoint"],
            transfer_request_payload["destination_endpoint"],
        )

        for transfer_item in transfer_request_payload["transfer_items"]:
            transfer_data.add_item(
                transfer_item["source_path"],
                transfer_item["destination_path"],
                recursive=transfer_item["recursive"],
            )

        print(transfer_data)
        try:
            transfer_result = transfer_client.submit_transfer(transfer_data)
        except Exception as error:
            print(error)
            return Response({"code": "Denied"})
        
        print(transfer_result)
        transfer_response = {
            "code": transfer_result["code"],
            "message": transfer_result["message"],
            "request_id": transfer_result["request_id"],
            "submission_id": transfer_result["submission_id"],
            "task_id": transfer_result["task_id"],
        }
        task_link = {
            "href": transfer_result["task_link"]["href"],
        }
        transfer_response["task_link"] = task_link
        return Response(transfer_response)
