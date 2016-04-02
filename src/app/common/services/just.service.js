angular.module('just.service', [])
  .service('i18nService', ['$translate','tmhDynamicLocale','settings', 'localStorageService', 'justFlowService', 'justRoutes', function($translate, tmhDynamicLocale, settings, storage, flow, routes) {
    var that = this;
    this.useLanguage = function(code) {
      that.updateLanguage(code);
      flow.completed(routes.global.start.url);
    };

    this.updateLanguage = function (code) {
      $translate.use(code);
      tmhDynamicLocale.set(code);
      storage.set("language", code);
      that.language = code;
    };

    this.updateLanguage(storage.get("language") || 'sv');
    this.supportedLanguages = function() {
      return settings.translated_languages;
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
        $http.post(settings.just_match_api + "/api/v1/user_sessions", data)
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

      this.contact = function(data) {
        window.console.log(data);
        var deferd = $q.defer();
        $http.post(settings.just_match_api + "/api/v1/contact", data)
          .then(function(resp) {
            window.console.log(resp);
            deferd.resolve();
          }, function (err) {
            window.console.log(err);
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
  .service('jobService', ['justFlowService', 'AuthService', 'Resources', 'justRoutes', function (flow, authService, Resources, routes) {
    var that = this;

    this.jobModel = {data: {
      attributes: {}
    }};
    this.jobMessage = {};
    this.getJob = function (id) {
      return Resources.job.get({id: id});
    };
    this.getJobs = function () {
      return Resources.jobs.get();
    };

    this.create = function (job) {
      that.jobModel = job;
      if (authService.isAuthenticated()) {
          Resources.jobs.create(job, function (data) {
          flow.next(routes.job.approve.resolve(data), data);
        }, function (error) {
          that.jobMessage = error;
          flow.reload(routes.job.create.url);
        });
      } else {
        flow.redirect(routes.user.select.url, function () {
          that.create(job);
        });
      }
    };
  }])
  .service('userService', ['justFlowService', 'AuthService', 'justRoutes', 'Resources',  function (flow, authService, routes, Resources) {
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

    this.registerModel = {};
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
  .service('datastoreService', ['settings', 'JsonApiDataStore', '$http', '$q',
    function(settings, jsonApiDataStore, $http, $q) {
      return {
        fetch: function (path) {
          return $http.get(settings.just_match_api + "/api/v1/" + path)
            .then(function (response) {
              if (typeof response.data === 'object') {
                // https://github.com/beauby/jsonapi-datastore
                jsonApiDataStore.store.sync(response.data);

                return jsonApiDataStore;
              } else {
                return $q.reject(response.data);
              }
            }, function (response) {
              return $q.reject(response.data);
            });
        }
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
