
function onRangeInputEvent(resultID) {
  var brightness = $('#search-results-preview-brightness-slider-' + resultID).val()
  var contrast = $('#search-results-preview-contrast-slider-' + resultID).val()
  var contrastMax = $('#search-results-preview-contrast-slider-' + resultID).attr('max')
//  console.log('Picker Contrast', contrast)
  var contrastMin = $('#search-results-preview-contrast-slider-' + resultID).attr('min')
  contrast = Number(contrastMax) - Number(contrast) + Number(contrastMin);
//  console.log('Brightness', brightness)
//  console.log('Contrast', contrast)
  var filterVal = "contrast("+contrast+"%)brightness("+brightness+"%)";
  $('#search-results-preview-image-' + resultID)
    .css("-webkit-filter", filterVal)
    .css('filter',filterVal)
    .css('webkitFilter',filterVal)
    .css('mozFilter',filterVal)
    .css('oFilter',filterVal)
    .css('msFilter',filterVal);
}
