angular.module('just.common')
  .controller('LanguageCtrl', ['i18nService','$scope', function (i18nService, $scope) {
    var that = this;
    i18nService.supportedLanguages()
      .then(function (langs) {
        that.languages = langs;
      });
    i18nService.getLanguage()
      .then(function (lang) {
        that.language = lang;
      });

    this.useLanguage = function (lang) {
      i18nService.useLanguage(lang);
    };
  }]);
