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
    'LocalStorageModule',
    'beauby.jsonApiDataStore'
  ])
  .constant('justRoutes', {
    global: {
      contact: {
        url: '/contact',
        handler: {
          templateUrl: 'common/templates/contact.html',
          controller: 'ContactCtrl as ctrl'
        }
      },
      start: {
        url: '/',
        handler: {
          templateUrl: 'common/templates/start.html',
          controller: 'StartCtrl as ctrl'
        }
      },
      select_language: {
        url: '/select-language',
        handler: {
          templateUrl: 'common/templates/select-language.html',
          controller: 'LanguageCtrl as ctrl'
        }
      },
      menu: {
        url: '/menu',
        handler: {
          templateUrl: 'common/templates/menu.html'
        }
      }
    },
    user: {
      select: {
        url: '/user/select',
        handler: {
          templateUrl: 'common/templates/select-login.html'
        }
      },
      register: {
        url: "/user/register",
        handler: {
          templateUrl: 'common/templates/register.html',
          controller: 'RegisterCtrl as ctrl'
        }
      },
      signin: {
        url: '/user/signin',
        handler: {
          templateUrl: 'common/templates/signin.html',
          controller: 'SigninCtrl as ctrl'
        }
      },
      signed_in: {
        url: '/user/welcome',
        handler: {
        }
      },
      user: {
        url: '/user',
        handler: {
          templateUrl: 'common/templates/user.html',
          controller: 'UserCtrl as ctrl'
        }
      }
    },
    job: {
      create: {
        url: '/job/create',
        handler: {
          templateUrl: 'common/templates/new-job.html',
          controller: 'JobCtrl as ctrl'
        }
      },
      approve: {
        url: '/jobs/:id/approve',
        resolve: function (obj) {
          return '/jobs/' + obj.id + '/approve';
        },
        handler: {
          templateUrl: 'common/templates/approve-job.html',
          controller: 'ApproveJobCtrl as ctrl'
        }
      },
      get: {
        url: '/jobs/:id',
        resolve: function (obj) {
          return '/jobs/' + obj.id;
        },
        handler: {
          templateUrl: 'common/templates/view-job.html',
          controller: 'ViewJobCtrl as ctrl'
        }

      },
      list: {
        url: '/jobs',
        handler: {
          templateUrl: 'common/templates/list-jobs.html',
          controller: 'ListJobCtrl as ctrl'
        }
      }
    },
    contact: {
      form: {
        url: '/contact/new',
        handler: {
          templateUrl: 'common/templates/contact.html',
          controller: 'ContactCtrl as ctrl'
        }
      },
      completed: {
        url: '/contact/completed',
        handler: {
          templateUrl: 'common/templates/contact-completed.html',
          controller: 'ContactCtrl as ctrl'
        }
      }
    }
  })
  .run(['$rootScope', 'justRoutes', function ($rootScope, routes) {
    $rootScope.routes = routes;
  }])
  .config(function ($routeProvider, $locationProvider, justRoutes) {
    angular.forEach(justRoutes, function(comp) {
      angular.forEach(comp, function(route) {
        $routeProvider.when(route.url, route.handler);
      });
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
