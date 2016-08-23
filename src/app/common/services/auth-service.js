angular.module('just.service')
/**
 * @ngdoc service
 * @name just.service.service:authService
 * @description
 *
 * Handles auth_token and signin/signout of users.
 */
    .service('authService', ['$http', '$q', 'settings', 'localStorageService', 'i18nService', '$location', 'justFlowService', 'justRoutes', 'Resources',
        function ($http, $q, settings, storage, i18nService, $location, flow, routes, Resources) {
            var that = this;
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
                storage.remove('user_id');
                storage.remove('promocode');
                delete $http.defaults.headers.common.Authorization;
                delete $http.defaults.headers.common["X-API-PROMO-CODE"];
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

            this.checkPromoCode = function () {
                var d = $q.defer();
                if (!that.isAuthenticated()) {
                    if (settings.promo_code_check) {
                        //get promocode from querystring
                        var promocode = $location.search().promo_code;

                        if (typeof(promocode) === 'undefined') {
                            //promcode is undefined
                            if (storage.get("promocode")) {
                                promocode = storage.get("promocode");
                            }
                        }
                        var promoData = {data: {attributes: {"promo-code": promocode}}};

                        if (promocode === "") {
                            storage.remove('promocode');
                            delete $http.defaults.headers.common["X-API-PROMO-CODE"];
                            flow.completed(routes.global.promo.url, 0);
                            d.resolve(0);
                        } else {
                            Resources.promoCode.create({}, promoData, function (response) {
                                storage.set("promocode", promocode);
                                if(!$http.defaults.headers.common["X-API-PROMO-CODE"]){
                                    $http.defaults.headers.common["X-API-PROMO-CODE"] = promocode;
                                    //$route.reload();
                                    i18nService.reloadLang();
                                }else{
                                    $http.defaults.headers.common["X-API-PROMO-CODE"] = promocode;
                                }

                                d.resolve(1);

                            }, function (err) {
                                storage.remove('promocode');
                                delete $http.defaults.headers.common["X-API-PROMO-CODE"];
                                flow.completed(routes.global.promo.url, 0);
                                d.resolve(0);
                            });
                        }
                    }else{
                        d.resolve(1);
                    }
                } else {
                    delete $http.defaults.headers.common["X-API-PROMO-CODE"];
                    d.resolve(1);
                }
                return d.promise;
            };
        }]
    );
