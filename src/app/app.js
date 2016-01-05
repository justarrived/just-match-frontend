angular.module('just', [
    'templates-app',
    'ngRoute',
    'ngResource',
    'just.constant',
    'just.translation',
    'just.common'
  ]).config(function ($routeProvider, $locationProvider, settings, translationsProvider) {
    settings.translationModules.forEach(function (translationModule) {
      translationsProvider.register(translationModule);
    });

    $routeProvider
      .when('/', {
        templateUrl: 'common/templates/start.html',
        controller: 'StartCtrl'
      });

    /*    $locationProvider.html5Mode(true);
     $locationProvider.hashPrefix('!'); */
  });
