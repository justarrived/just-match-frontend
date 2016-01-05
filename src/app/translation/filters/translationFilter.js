angular.module('just.translation')
.filter('trans', function (translator) {
  return function (text) {
    return translator.translate(text);
  };
});
