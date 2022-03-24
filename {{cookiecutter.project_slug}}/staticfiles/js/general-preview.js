/*
This javascript module enables you to preview any document with user credentials
provided the server has CORS enabled (Petrel does)

You'll need a couple things to preview documents, a place to display the content
and a script tag for passing search data into this module.

At the top of (probably your detail-preview.html) module, add the following:

<script>
  // Disable Column Truncation
  // TRUNCATE_TABULAR_DATA_COLUMNS = 0;

  // Get the data from Django templates into a list of javascript objects
  // Each object should have 'url' and 'mimetype' as a minimum.
  let rfmFiles = [
  {% for file in remote_file_manifest %}
    {
      'id': '{{forloop.counter}}',
      'url': '{{file.url}}',
      'mimetype': '{{file.mime_type}}',
      'previewBytes': '{{file.field_metadata.previewbytes}}', // optional, defaults to 2048 bytes.
    },
  {% endfor %}
  ]
  var file = rfmFiles[0];
  var myId = 'preview-content';
  getAccessToken("{% url 'access_token' %}", "petrel_https_server")
  .then(token => loadContent(file, token, myId))
</script>

Then, somewhere in your templates, include a div with your ID:

<div id='preview-content'></div>

Your content will be loaded when the page loads.
*/
let TRUNCATE_TABULAR_DATA_COLUMNS = 10

function getAccessToken(accessTokenURL, resourceServer) {
  return fetch(accessTokenURL + '?resource_server=' + resourceServer)
    .then(response => response.json())
    .then(jresponse => jresponse.token)
}

// From Stackoverflow:
// https://stackoverflow.com/questions/41348421/how-to-properly-parse-multipart-byteranges-responses-using-typescript-javascript
function parseMultipartBody (body, boundary) {
  return body.split(`--${boundary}`).reduce((parts, part) => {
    if (part && part !== '--') {
      const [ head, body ] = part.trim().split(/\r\n\r\n/g)
      parts.push({
        body: body,
        headers: head.split(/\r\n/g).reduce((headers, header) => {
          const [ key, value ] = header.split(/:\s+/)
          headers[key.toLowerCase()] = value
          return headers
        }, {})
      })
    }
    return parts
  }, [])
}

// Petreldata does not return the boundary in the response, so we can't properly
// hand it off to the parseMultipartBody function. This results in a line of the
// Boundary remaining on the content. Strip it off and return the raw text.
function cleanupMultipartContent(multipartText) {
    var content = parseMultipartBody(multipartText)[0]
    var text_content = content.body.split('\n');
    // Remove last Multipart boundary line
    text_content.pop();
    // Remove last malformed line
    text_content.pop();
    text_content = text_content.join('\n');
    return text_content
}

function fetchPartialTextDocument(file, token) {
  // grab the first 2k of the file
  var previewBytes = 2048;
  if (!isNaN(Number(file.previewBytes)) && Number(file.previewBytes) != 0) {
    previewBytes = Number(file.previewBytes);
  }
  console.log('Fetching ' + previewBytes + ' bytes from top of file.')
  return fetchAuthenticatedContent(file, token, previewBytes)
    .then(response => response.text())
    .then(rawContent => {return cleanupMultipartContent(rawContent)})
}

function previewPreformattedText(text, previewId) {
  var p = document.getElementById(previewId)
  var contentHolder = document.createElement("pre");
  contentHolder.innerHTML = text;
  p.appendChild(contentHolder);
}

function previewTextDocument(file, token, previewId) {
  var promise = fetchPartialTextDocument(file, token)
  .then(response => {
    previewPreformattedText(response, previewId); return response
  });
  return promise;
}

function previewJSON(file, token, previewId) {
  console.log('Previewing Json')
  return fetchAuthenticatedContent(file, token, null)
    .then(response => response.text())
    .then(json => previewPreformattedText(json, previewId))
}

function previewTsv(file, token, previewId) {
  return previewTabularData(file, token, previewId, '\t')
}

function previewCsv(file, token, previewId) {
  return previewTabularData(file, token, previewId, ',')
}

// Preview the first 10 rows of a tsv or csv
function previewTabularData(file, token, previewId, delimiter) {
  var promise = fetchPartialTextDocument(file, token)
  .then(text => {
    if (TRUNCATE_TABULAR_DATA_COLUMNS > 0) {
      var lines = [];
      text.split('\n').forEach(line => {
        lines.push(line.split(delimiter).slice(0, TRUNCATE_TABULAR_DATA_COLUMNS).join(delimiter))
      });
      text = lines.join('\n')
    }
    previewPreformattedText(text, previewId);
  });
  return promise;
}

function fetchAuthenticatedContent(fileData, token, range) {
  var headers = {
      "Authorization": "bearer " + token,
    }
  if (typeof range == 'number') {
    headers['Range'] = 'bytes=0-' + range
  }
  return fetch(fileData.url, {
    method: 'GET',
    headers: headers,
  }).then(function (response) {
    if (response.ok) {
      return response
    } else {
      throw response;
    }
  })
}

function fetchImage(fileData, token, parentElement) {
  return fetchAuthenticatedContent(fileData, token)
  .then(response => response.blob())
  .then(blob => {
    let parent = document.getElementById(parentElement);
    if (parent) {
      let url = URL.createObjectURL(blob);
      var img = document.createElement("img");
      img.src = url;
      $(img).addClass("img-thumbnail preview-image");
      parent.appendChild(img);
    } else {
      console.log('Failed to find: ' + fileData.url)
    }
  })
}

function embedPDF(fileData, token, parentElement) {
  var iframe = document.createElement('embed');
  iframe.classList.add('embed-responsive-item')
  iframe.src = fileData.url

  var div = document.createElement('div');
  div.classList.add('embed-responsive')
  div.classList.add('embed-responsive-1by1')
  div.appendChild(iframe);

  let parent = document.getElementById(parentElement);
  parent.appendChild(div);

  return Promise.resolve()
}


function errorLoadingContent(contentID, errorText=null) {

  errorText = errorText || 'No preview for file.';
  var error = document.createElement('div');
  let errorHTML = '' +
    '<div class="alert alert-info" role="alert">' +
    errorText +
    '</div>'
  error.innerHTML = errorHTML
  error.id = contentID + '-error';

  var content = document.getElementById(contentID);
  content.appendChild(error)
}

function loadContent(file, token, contentID, functionChooser=determineLoaderFunction, err=errorLoadingContent) {
  if (!functionChooser) {
    console.error('The Function Chooser is null, please set it in loadContent!')
  }
  func = functionChooser(file)
  if (!func) {
    console.error('The Function Chooser returned null!, No function for loading content!')
  }

  let spinner = '' +
  '<div class="d-flex justify-content-center">' +
  '  <div class="spinner-border" role="status">' +
  '    <span class="sr-only">Loading...</span>' +
  '    </div>' +
  '</div>'
  let spinnerId = contentID + '-spinner'
  var loadingSpinner = document.createElement('div');
  loadingSpinner.innerHTML = spinner
  loadingSpinner.id = spinnerId;
  var content = document.getElementById(contentID);
  if (!content || content == undefined) {
    console.error(file)
    console.error('"contentID" for above file is undefined! Unable to load content')
  }

  if (!func) {
    return err(contentID)
  } else {
    content.appendChild(loadingSpinner)
    return func(file, token, contentID)
    .then(response => {
      $('#' + spinnerId).hide();
      return response
    })
    .catch(error => {
      $('#' + spinnerId).hide();
      var msg;
      if (error.status == 404) {
        msg = 'File not found, it may have moved or been deleted.';
      } else if (error.status == 401) {
        msg = 'You do not have permission to view this content.';
      } else {
        console.error('Encountered unexpected error:', error)
      }
      errorLoadingContent(contentID, msg)
    });
  }
}

function determineLoaderFunction(file) {
  console.log('Determining loader function based on mimetype ' + file.mimetype)
  if (file.mimetype.includes('image')) {
    return fetchImage
  } else if (file.mimetype == 'application/pdf') {
    return embedPDF
  } else if (file.mimetype == 'text/tab-separated-values') {
    return previewTsv
  } else if (file.mimetype == 'text/csv') {
    return previewCsv
  } else if (file.mimetype.includes('json')) {
    return previewJSON
  } else if (file.mimetype.includes('text')) {
    return previewTextDocument
  } else {
    console.error('No function loader to handle mimetype ' + file.mimetype +
    ' for file ' + file.url)
  }

}
