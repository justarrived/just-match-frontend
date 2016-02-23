angular.module('just', [
    'templates-app',
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'just.constant',
    'just.common',
    'just.service',
    'pascalprecht.translate',
    'tmh.dynamicLocale'
  ])
  .config(function ($routeProvider, $locationProvider, settings) {
    $routeProvider
      .when('/', {
        templateUrl: 'common/templates/start.html',
        controller: 'StartCtrl as ctrl'
      })
      .when('/register', {
        templateUrl: 'common/templates/register.html',
        controller: 'RegisterCtrl'
      });

    /*    $locationProvider.html5Mode(true);
     $locationProvider.hashPrefix('!'); */
  })
  .config(function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.5.0/i18n/angular-locale_{{locale}}.js');
  })
  .config(['$translateProvider', function ($translateProvider) {
    //$translateProvider.useSanitizeValueStrategy('sanitize');
    $translateProvider.useStaticFilesLoader({
      prefix: '/translations/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('sv');
    $translateProvider.fallbackLanguage('sv');
  }]);

