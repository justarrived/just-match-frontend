angular.module('just.service')
/**
 * @ngdoc service
 * @name just.service.service:authService
 * @description
 *
 * Handles auth_token and signin/signout of users.
 */
    .service('authService', ['$http', '$q', 'settings',
        'localStorageService', 'i18nService',
        function ($http, $q, settings, storage, i18nService) {
            var current_auth_token = storage.get('auth_token');
            if (current_auth_token) {
                $http.defaults.headers.common.Authorization = current_auth_token;
            }
            this.isAuthenticated = function () {
                return typeof $http.defaults.headers.common.Authorization === 'string';
            };
            this.userId = function () {
                return storage.get("user_id");
            };
            this.login = function (data) {
                var deferd = $q.defer();
                $http.post(settings.just_match_api + settings.just_match_api_version + "users/sessions", data)
                    .then(function (resp) {
                        var token = 'Token token=' + resp.data.data.attributes["auth-token"];
                        storage.set("auth_token", token);
                        storage.set("user_id", resp.data.data.attributes["user-id"]);
                        $http.defaults.headers.common.Authorization = token;
                        return $http.get(settings.just_match_api + "/api/v1/users/" + resp.data.data.attributes["user-id"]);
                    }, function (err) {
                        deferd.reject(err);
                    }).then(function (resp) {
                    storage.set("user_id", resp.data.data);
                    i18nService.useLanguageById(resp.data.data.attributes["language-id"]);
                    deferd.resolve();
                });
                return deferd.promise;
            };

            this.logout = function () {
                storage.remove('auth_token');
                delete $http.defaults.headers.common.Authorization;
            };

            this.checkLogin = function (data, fn) {
                var deferd = $q.defer();
                $http.post(settings.just_match_api + settings.just_match_api_version + "users/sessions", data)
                    .then(function (resp) {
                        var token = 'Token token=' + resp.data.data.attributes["auth-token"];
                        storage.set("auth_token", token);
                        storage.set("user_id", resp.data.data.attributes["user-id"]);
                        $http.defaults.headers.common.Authorization = token;
                        if (fn) {
                            fn(1, resp);
                        }
                    }, function (err) {
                        if (fn) {
                            fn(0, err);
                        }
                        deferd.reject(err);
                    }).then(function (resp) {

                    deferd.resolve();
                });
                return deferd.promise;
            };
        }]
    );
