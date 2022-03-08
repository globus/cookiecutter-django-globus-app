from .base import parameters
from {{ cookiecutter.project_slug }} import fields

SEARCH_INDEXES = {
    'my-search-index': {
        'uuid': parameters('GLOBUS_SEARCH_INDEX'),
        'name': 'My Search Index',
        'fields': [
            ('dc', fields.dc),
            ('title', fields.title),
            ('formatted_search_results', fields.formatted_search_results),
            ('formatted_files', fields.formatted_files),
        ],
        'facets': [
            {
                'name': 'Publisher',
                'field_name': 'dc.publisher',
                'size': 10,
                'type': 'terms'
            },
            {
                'name': 'Type',
                'field_name': 'dc.subjects.subject',
                'size': 10,
                'type': 'terms'
            },
            {
                'name': 'Type',
                'field_name': 'dc.formats',
                'size': 10,
                'type': 'terms'
            },
            {
                'name': 'File Size (Bytes)',
                'type': 'numeric_histogram',
                'field_name': 'files.length',
                'size': 10,
                'histogram_range': {'low': 5000, 'high': 10000},
            },
            {
                "name": "Dates",
                "field_name": "dc.dates.date",
                "type": "date_histogram",
                "date_interval": "hour",
            },
        ],
    }
}