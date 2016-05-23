/**
 * @ngdoc service
 * @name just.service.service:datastoreService
 * @description
 * # datastoreService
 * Service to handle data...
 */
angular.module('just.service')
    .service('datastoreService', ['settings', 'JsonApiDataStore', '$http', '$q', 'localStorageService',
        function (settings, jsonApiDataStore, $http, $q, storage) {
            var token = storage.get("auth_token");
            var promocode = storage.get("promocode");
            if (token) {
                $http.defaults.headers.common.Authorization = token;
            }
            if (promocode) {
                $http.defaults.headers.common["X-API-PROMO-CODE"] = promocode;
            }
            return {
                fetch: function (path) {
                    return $http.get(settings.just_match_api + settings.just_match_api_version + path)
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
        }]);
