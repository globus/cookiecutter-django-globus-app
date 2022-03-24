from {{ cookiecutter.project_slug }} import fields

def get_rfm(search_result):
    if search_result[0].get("remote_file_manifest"):
        return [search_result[0]["remote_file_manifest"]]
    else:
        return []


SEARCH_INDEXES = {
    "terrafusion": {
        "uuid": "{{ cookiecutter.globus_search_index }}",
        "name": "OSN",
        "template_override_dir": "osn",
        "fields": [
            "dc",
            "files",
            "project_metadata",
            ("date", fields.date),
            ("title", fields.title),
            ("detail_general_metadata", fields.detail_general_metadata),
            ("https_url", fields.https_url),
            ("copy_to_clipboard_link", fields.https_url),
            ("globus_app_link", fields.globus_app_link),
        ],
        "facets": [
            {
                "name": "Location",
                "field_name": "project_metadata.location",
            },
            {
                "name": "Dates",
                "field_name": "dc.dates.date",
                "type": "date_histogram",
                "date_interval": "year",
            },
            {
                "name": "Orbit Groups",
                "field_name": "project_metadata.orbit_path_name",
            },
            {
                "name": "Orbit",
                "field_name": "project_metadata.orbit_path_number",
                "type": "numeric_histogram",
                "histogram_range": {"low": 0, "high": 240},
                "filter_type": "range",
                "size": 40,
            },
            {
                "name": "Subjects",
                "field_name": "dc.subjects.subject",
            },
            {
                "name": "Contributors",
                "field_name": "dc.contributors.contributorName",
            },
        ],
        "sort": [{"field_name": "dc.dates.date", "order": "asc"}],
    }
}
