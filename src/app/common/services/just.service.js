angular.module('just.service', [])
  .service('i18nService', [
    '$translate', 'tmhDynamicLocale','settings',
    'localStorageService', 'justFlowService',
    'justRoutes', 'Resources', '$q', function($translate, tmhDynamicLocale, settings, storage, flow, routes, Resources, $q) {
      var that = this;

      this.getDefaultLang = function (langs) {
        var defLang = langs.filter(function (lang) {
          return lang.attributes.lang_code === 'sv';
        });

        if (defLang.length === 0) {
          return langs[0];
        }
        return defLang[0];
      };
      this.langResolve = $q(function (resolve, reject) {
        that.allLanguages = Resources.languages.get(function (langs) {
          var lang = that.getDefaultLang(langs.data);
          that.updateLanguage(lang);
          window.console.log("Resovle lang:" + lang.attributes.lang_code);
          resolve(lang);
        });
      });

      this.getLanguage = function () {
        var language = storage.get("language");
        if (angular.isDefined(language)) {
          return language;
        }
        return that.langResolve;
      };

      this.useLanguage = function(lang) {
        that.updateLanguage(lang);
        flow.completed(routes.global.start.url);
      };

      this.updateLanguage = function (lang) {
        $translate.use(lang.attributes.lang_code);
        tmhDynamicLocale.set(lang.attributes.lang_code);
        storage.set("language", lang);
      };


      this.supportedLanguages = function () {
        return that.allLanguages;
      };
    }])
  .service('AuthService', ['$http', '$q', 'settings', 'localStorageService', function ($http, $q, settings, storage) {
      var current_auth_token = storage.get('auth_token');
      if (current_auth_token) {
        $http.defaults.headers.common.Authorization = current_auth_token;
      }
      this.isAuthenticated = function() {
        return typeof $http.defaults.headers.common.Authorization === 'string';
      };
      this.userId = function () {
        return storage.get("user_id");
      };
      this.login = function (data) {
        var deferd = $q.defer();
        $http.post(settings.just_match_api + "/api/v1/users/sessions", data)
          .then(function(resp) {
            var token = 'Token token=' + resp.data.data.attributes.auth_token;
            storage.set("auth_token", token);
            storage.set("user_id", resp.data.data.attributes.user_id);

            $http.defaults.headers.common.Authorization = token;
            deferd.resolve();
          }, function (err) {
            deferd.reject(err);
          });
        return deferd.promise;
      };

      this.logout = function () {
        storage.remove('auth_token');
        delete $http.defaults.headers.common.Authorization;
      };
    }]
  )
  .service('justFlowService', ['$location', '$route', function ($location, $route) {
    var that = this;
    this.stack = [];

    this.reload = function (path) {
      $location.path(path);
      $route.reload();
    };

    this.redirect = function(path, onComplete) {
      if (angular.isFunction(onComplete)) {
        that.stack.push(onComplete);
      }
      $location.path(path);
    };

    this.push = function(fn) {
      if (angular.isFunction(fn)) {
        that.stack.push(fn);
      }
    };

    this.next = function(path, data) {
      that.next_data = data;
      $location.path(path);
    };

    this.completed = function(path, data) {
      if (that.stack.length > 0) {
        that.stack.pop()();
        return;
      }
      that.completed_data = data;
      $location.path(path);
    };
  }])
  .service('jobService', ['$q', 'justFlowService', 'AuthService',
    'Resources', 'justRoutes','i18nService', '$timeout', function ($q, flow, authService, Resources, routes, i18nService, $timeout) {
      var that = this;
      this.rates = function () {
        var rates = [
          {value: 80, name: 'assignment.new.rate.low'},
          {value: 100, name: 'assignment.new.rate.medium'},
          {value: 120, name: 'assignment.new.rate.high'},
        ];
        return rates;
      };
      this.jobModel = {data: {
        attributes: {"language_id": i18nService.getLanguage().id, "max_rate": "80"}
      }};
      this.jobMessage = {};
      this.getJob = function (id) {
        return Resources.job.get({id: id});
      };
      this.getJobs = function () {
        return Resources.jobs.get();
      };
      this.approve = function (job) {
        Resources.jobs.create(job, function (data) {
          flow.next(routes.job.approved.url, data);
        }, function (error) {
          that.jobMessage = error;
          flow.reload(routes.job.create.url);
        });
      };
      this.edit = function (job) {
        flow.next(routes.job.create.url, job);
      };

      this.create = function (job) {
        that.jobModel = job;
        if (authService.isAuthenticated()) {
            flow.next(routes.job.approve.url);
        } else {
          flow.redirect(routes.user.select.url, function () {
            that.create(job);
          });
        }
      };
    }])
  .service('userService', ['justFlowService', 'AuthService', 'i18nService', 'justRoutes', 'Resources',  function (flow, authService, i18nService, routes, Resources) {
    var that = this;

    this.signinModel = {};
    this.signinMessage = {};

    this.signin = function (attributes) {
      authService.login({data : {attributes: attributes}})
        .then(function (ok) {
          flow.completed(routes.user.signed_in.url, ok);
        }, function (error) {
          that.signinMessage = error;
          flow.reload(routes.user.signin.url);
        });
    };

    this.registerModel = {language_id: i18nService.getLanguage().id};
    this.registerMessage = {};

    this.register = function (attributes) {
      that.registerModel = attributes;
      var user = Resources.user.create({data: {attributes: attributes}}, function () {
        flow.push(function () {
          flow.completed(routes.user.created.url, user);
        });
        that.signin(attributes);

      }, function (error) {
        that.registerMessage = error;
        flow.reload(routes.user.register.url);
      });
    };

    this.userModel = function() {
      if (angular.isUndefined(that.user)) {
        that.user = Resources.user.get({id: authService.userId()});
      }
      return that.user;
    };
  }])
  .service('contactService', ['justFlowService', 'justRoutes', 'Resources',function(flow, routes, resources) {
    var that = this;
    this.process = function (attributes) {
      resources.contact.create({data : {attributes: attributes}},
        function (ok) {
          flow.next(routes.contact.completed.url);
        }, function (error) {
          //TODO
          that.message = error;
          window.console.log(error);
        }
      );
    };
  }]);
