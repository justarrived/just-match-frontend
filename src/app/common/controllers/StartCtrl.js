angular.module('just.common')
  .controller('StartCtrl', ['i18nService', function (i18nService) {
    this.languages = i18nService.supportedLanguages();
    this.language = 'sv';
    this.selectLanguage = function () {
      i18nService.useLanguage(this.language);
    };
  }]);
