from dateutil.parser import isoparse
from urllib.parse import urlsplit, urlunsplit, urlunparse, urlencode

import os


def title(result):
    return result[0]['files'][0]['filename']


def date(result):
    return isoparse(result[0]['dc']['dates'][0]['date'])


def https_url(result):
    path = urlsplit(result[0]['files'][0]['url']).path
    return urlunsplit(('https', 'g-80370a.10bac.8443.data.globus.org', path,
                       '', ''))


def detail_general_metadata(result):
    def generate_name(field_name):
        return ' '.join([w.capitalize() for w in field_name.split('_')])
    fields = [
        {'field_name': k, 'value': v, 'name': generate_name(k)}
        for k, v in result[0]['project_metadata'].items()
    ]
    return fields


def globus_app_link(result):
    url = result[0]['files'][0]['url']
    parsed = urlsplit(url)
    query_params = {'origin_id': parsed.netloc,
                    'origin_path':  os.path.dirname(parsed.path)}
    return urlunsplit(('https', 'app.globus.org', 'file-manager',
                      urlencode(query_params), ''))
