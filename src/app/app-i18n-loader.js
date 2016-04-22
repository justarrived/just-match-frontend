angular.module('just.translate', [])
  .config(['tmhDynamicLocaleProvider', function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.5.0/i18n/angular-locale_{{locale}}.js');
  }])
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useStaticFilesLoader({
      prefix: '/translations/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('sv');
    $translateProvider.fallbackLanguage('sv');
  }]);