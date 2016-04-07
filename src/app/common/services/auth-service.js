angular.module('just.service')
  /**
   * @ngdoc service
   * @name just.service.service:authService
   * @description
   *
   * Handles auth_token and signin/signout of users.
   */
  .service('authService', ['$http', '$q', 'settings', 'localStorageService', function ($http, $q, settings, storage) {
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
  );
