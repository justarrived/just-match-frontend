angular.module('just.common')
  .controller('StartCtrl', ['i18nService', 'jobService', function (i18nService, jobService) {
    this.languages = i18nService.supportedLanguages();

    this.jobs = jobService.getJobs();

    this.language = 'sv';
    this.selectLanguage = function () {
      i18nService.useLanguage(this.language);
    };

  }]);