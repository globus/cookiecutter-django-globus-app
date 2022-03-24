
function getAccessToken(accessTokenURL, resourceServer) {
  return fetch(accessTokenURL + '?resource_server=' + resourceServer)
    .then(response => response.json())
}

function fetchImages(imageData, token) {
  imageData.forEach(function (previewData) {
    if (previewData.imgURL) {
      fetch(previewData.imgURL, {
        method: 'GET',
        headers: {
          "Authorization": "bearer " + token,
        }
      }).then(function (response) {
            if (response.ok) {
              return response.blob()
            } else {
              $("div#search-results-preview-image-loading-" + previewData.id).hide();
              $("div#search-results-preview-image-group-" + previewData.id)
                .parent().append('<p>Preview Unable To Load</p>')
              return null;
            }
      }).then(blob => {
        if (blob == null) {
          return;
        }
        let img = document.getElementById('search-results-preview-image-' + previewData.id);
        if (img) {
          let url = URL.createObjectURL(blob);
          img.src = url;
          // Ensure range slider defaults are set
          onRangeInputEvent(previewData.id);
        } else {
          console.log('Failed to find: ' + previewData.id)
        }
      })
    } else {
      console.log('Not processing' + previewData.imgId)
    }
  });
}
