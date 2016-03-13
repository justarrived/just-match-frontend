angular.module('just', [
    'templates-app',
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'just.constant',
    'just.common',
    'just.service',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'LocalStorageModule'
  ])
  .config(function ($routeProvider, $locationProvider, settings) {
    $routeProvider
      .when('/', {
        templateUrl: 'common/templates/start.html',
        controller: 'StartCtrl as ctrl'
      })
      .when('/register', {
        templateUrl: 'common/templates/register.html',
        controller: 'RegisterCtrl as ctrl'
      })
      .when('/select-login', {
        templateUrl: 'common/templates/select-login.html',
      })
      .when('/signin', {
        templateUrl: 'common/templates/signin.html',
        controller: 'SigninCtrl as ctrl'
      })
      .when('/new-job', {
        templateUrl: 'common/templates/new-job.html',
        controller: 'JobCtrl as ctrl'
      })
      .when('/contact', {
        templateUrl: 'common/templates/contact.html',
        controller: 'ContactCtrl as ctrl'
      });

    /*    $locationProvider.html5Mode(true);
     $locationProvider.hashPrefix('!'); */
  })
  .config(function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.5.0/i18n/angular-locale_{{locale}}.js');
  })
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useStaticFilesLoader({
      prefix: '/translations/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('sv');
    $translateProvider.fallbackLanguage('sv');
  }])
  .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('just-arrived')
      .setStorageType('sessionStorage');
  }]);
