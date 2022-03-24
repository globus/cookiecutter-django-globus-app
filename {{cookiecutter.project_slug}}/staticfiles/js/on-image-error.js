/*
This is intended for loading images through the <img> tag. The advantage is
we don't have to create a custom request for fetching the image. The downside is
we can't fetch authorized images
*/

function hideImage(image) {
    console.error(image.attr('src'))
    console.log('Image hidden to do load failure')
    var id = getImageId(image)
    $("div#search-results-preview-image-loading-" + id).hide();
}

function getImageId(img) {
  var tagInfo = img.attr('id').split('-');
  return tagInfo[tagInfo.length-1]
}

$(document).ready(function() {
    $('img.hide-on-error-with-message').on('error', function(error) {
        hideImage($(this));
        $(this).parent().append('<p>No Preview Available</p>')
    });

    $('img.hide-on-error').on('error', function(error) {
        hideImage($(this))
    });

    $('img').on('load', function(img) {
        var id = getImageId($(this))
        console.log($("#search-results-preview-image-loading-" + id))
        $("div#search-results-preview-image-loading-" + id).hide();
        $("div#search-results-preview-image-group-" + id).show(100);
    })
});