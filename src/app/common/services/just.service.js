angular.module('just.service', [])
  .service('i18nService', ['$translate','tmhDynamicLocale','settings', function($translate, tmhDynamicLocale, settings) {
    this.useLanguage = function(code) {
      $translate.use(code);
      tmhDynamicLocale.set(code);
    };
    this.supportedLanguages = function() {
      return settings.translated_languages;
    };
  }])
  .service('justMatchApi', ['$http', '$q','settings','localStorageService', function ($http, $q, settings, storage) {
      var current_auth_token = storage.get('auth_token');
      if (current_auth_token) {
        $http.defaults.headers.common.Authorization = current_auth_token;
      }
      this.isAuthenticated = function() {
        return typeof $http.defaults.headers.common.Authorization === 'string';
      };

      this.login = function (data) {
        var deferd = $q.defer();
        $http.post(settings.just_match_api + "/api/v1/user_sessions", data)
          .then(function(resp) {
            var token = 'Token token=' + resp.data.data.attributes.auth_token;
            storage.set("auth_token", token);
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

      this.createAccountPromise = function (body) {
        // Verify body..
        window.console.log(body);
        return $http.post(settings.just_match_api + "/api/v1/users", body);
      };

      this.createJobPromise = function (body) {
        // Verify body..
        return $http.post(settings.just_match_api + "/api/v1/jobs", body);
      };

      this.createContactPromise = function(body) {
        // Verify body..
        return $http.post(settings.just_match_api + "/api/v1/contact", body);
      };

      this.languages = function () {
        // Verify body..
        return $http.get(settings.just_match_api + "/api/v1/languages");
      };
    }]
  )
  .service('justFlowService', ['justMatchApi','$location', '$route', function (api, $location, $route) {
    var that = this;
    this.stack = [];
    this.models = {};
    this.reset = function (name) {
      that.get(name).data = {};
      that.get(name).message = {};
    };
    this.get = function (name) {
      var model = that.models[name];
      if (typeof model === 'undefined') {
        throw "No process for " + name + " is found";
      }
      return model;
    };
    this.init = function (name) {
      var model = {
        data: {},
        message: {}
      };
      that.models[name] = model;
      return model;
    };

    this.model = function (name) {
      return that.get(name).data || {};
    };

    this.message = function (name) {
      return that.get(name).message || {};
    };

    this.process = function (name, arg) {
      that.get(name).process(arg);
    };

    this.init('signin').process = function (attributes) {
      api.login({data : {attributes: attributes}})
        .then(function (ok) {
          if (that.stack.length > 0) {
            that.stack.pop()();
            return;
          }
          $location.path("/todo");
        }, function (error) {
          that.get('signin').message = error;
          $route.reload();
        });
    };

    this.init('contact').process = function (attributes) {
      api.createContactPromise({data : {attributes: attributes}})
        .then(
          function (ok) {
            $location.path("/contact-done");
          }, function (error) {
            //TODO
            that.get('contact').message = error;
            window.console.log(error);
          }
        );
    };

    this.init('account').process = function (attributes) {
      api.createAccountPromise({data: {attributes: attributes}})
        .then(
          function (ok) {
            if (that.stack.length > 0) {
              that.stack.pop()();
              return;
            }
            $location.path("/todo");
          }, function (error) {
            window.console.log(error);
            that.get('account').message = error;
            $route.reload();
          });
    };

    this.init('job').process = function (attributes) {
      that.get('job').data = attributes;
      if (api.isAuthenticated()) {
        api.createJobPromise({data: {attributes: attributes}})
          .then(function (ok) {
            that.reset('job');
            $location.path("/job-added");
          }, function (error) {
            that.get('job').message = error;
            $location.path('/new-job');
            $route.reload();
          });
      } else {
        that.stack.push(function () {
          that.process('job', attributes);
        });
        $location.path("/select-login");
      }
    };
  }]);
