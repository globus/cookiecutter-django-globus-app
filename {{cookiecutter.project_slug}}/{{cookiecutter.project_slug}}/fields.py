import datetime


def title(result):
    return result[0]['dc']['titles'][0]['title']


def formatted_search_results(result):
    """
    Create a curated list of the results we want to see on the search page.
    """
    entry = result[0]
    return [
        {
            'title': 'Publisher',
            'value': entry['dc']['publisher'],
        },
        {
            'title': 'Format',
            'value': entry['files'][0]['mime_type'],
        },
        {
            'title': 'Size (bytes)',
            'value': entry['files'][0]['length'],
        },
    ]


def formatted_files(result):
    entry = result[0]
    return [
        [
            {
                'title': 'Filename',
                'value': file_obj['filename'],
            },
            {
                'title': 'Format',
                'value': file_obj['mime_type'],
            },
            {
                'title': 'Size',
                'value': file_obj['length'],
            },
            {
                'title': 'MD5',
                'value': file_obj['md5'],
            },
            {
                'title': 'SHA256',
                'value': file_obj['sha256'],
            },
        ] for file_obj in entry['files']
    ]


def dc(result):
    for date in result[0]['dc']['dates']:
        date['date'] = datetime.datetime.fromisoformat(date['date'])
    return result[0]['dc']


def files(result):
    return result[0]['files']