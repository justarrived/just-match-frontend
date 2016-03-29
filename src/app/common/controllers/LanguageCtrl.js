angular.module('just.common')
  .controller('LanguageCtrl', ['i18nService','$scope', function (i18nService, $scope) {

    this.languages = i18nService.supportedLanguages();
    this.language = i18nService.getLanguage();
    this.useLanguage = function (lang) {
      i18nService.useLanguage(lang);
      $scope.$emit('language-change');
    };
  }]);
