/**
 * @ngdoc service
 * @name just.service.service:userService
 * @description
 * # userService
 * Service to handle users.
 */
angular.module('just.service')
    .service('userService', ['justFlowService', 'authService', 'i18nService', 'justRoutes', 'Resources', 'localStorageService', '$q', '$location', '$filter', '$rootScope', 'httpPostFactory', 'settings',
        function (flow, authService, i18nService, routes, Resources, storage, $q, $location, $filter, $rootScope, httpPostFactory, settings) {
            var that = this;

            this.signinModel = {};
            this.signinMessage = {};
            this.isCompanyRegister = -1;
            this.isCompany = -1;
            this.user = undefined;


            this.signin = function (attributes, completeCb) {
                authService.login({data: {attributes: attributes}})
                    .then(function (ok) {

                        $rootScope.$broadcast('onSigninSetmenu');

                        if (angular.isFunction(completeCb)) {
                            completeCb();
                        }
                        if (that.isCompanyRegister === 1) {
                            // Go to job new if register user from company register page
                            that.isCompanyRegister = -1;
                            flow.completed(routes.job.create.url, ok);
                        } else if (that.isCompanyRegister === 0) {
                            that.isCompanyRegister = -1;
                            flow.completed(routes.user.user.url, ok);
                        } else {
                            flow.completed();
                        }

                    }, function (error) {
                        that.signinMessage = error;
                        flow.reload(routes.user.signin.url);
                    });
            };

            this.registerModel = {};
            this.registerMessage = {};

            this.register = function (attributes, formData) {
                if (formData) {
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        var image_token = {};
                        image_token.data = {};
                        image_token.data.attributes = {};
                        image_token.data.attributes["user-image-one-time-token"] = callback.data.attributes["one-time-token"];
                        attributes["user-image-one-time-token"] = image_token.data.attributes["user-image-one-time-token"];
                        that.registerConfirm(attributes);
                    });
                } else {
                    that.registerConfirm(attributes);
                }
            };

            this.registerConfirm = function (attributes) {

                attributes.language_id = parseInt(i18nService.getLanguage().$$state.value.id);
                attributes.language_ids = [parseInt(i18nService.getLanguage().$$state.value.id)];

                that.registerModel = attributes;

                var user = Resources.user.create({data: {attributes: attributes}}, function () {
                    /*
                     flow.push(function () {
                     flow.completed(routes.user.created.url, user);
                     });
                     */
                    if (attributes.company_id) {
                        that.isCompanyRegister = 1;
                    } else {
                        that.isCompanyRegister = 0;
                    }
                    that.signin(attributes);
                }, function (error) {
                    that.registerMessage = error;
                    flow.reload(routes.user.register.url);
                });
            };

            this.companyId = function () {
                return storage.get("company_id");
            };

            this.userModel = function () {
                if (authService.isAuthenticated()) {
                    if (angular.isUndefined(that.user)) {
                        that.user = Resources.user.get({
                            id: authService.userId().id,
                            "include": "company,language,languages,user-images"
                        }, function () {
                            if (that.user.data.relationships.company.data !== null) {
                                var found = $filter('filter')(that.user.included, {
                                    id: "" + that.user.data.relationships.company.data.id,
                                    type: "companies"
                                }, true);
                                if (found.length > 0) {
                                    that.user.data.attributes["company-name"] = found[0].attributes.name;
                                }
                                storage.set("company_id", that.user.data.relationships.company.data.id);
                                that.isCompany = 1;
                                storage.set("company_id", that.user.data.relationships.company.data.id);
                            } else {
                                that.isCompany = 0;
                                storage.set("company_id", null);
                            }
                            that.user.data.attributes.user_image = 'assets/images/content/placeholder-profile-image.png';
                            if (that.user.data.relationships["user-images"].data.length > 0) {
                                var found_img = $filter('filter')(that.user.included, {
                                    type: that.user.data.relationships["user-images"].data[0].type
                                }, true);
                                if (found_img.length > 0) {
                                    that.user.data.attributes.user_image = found_img[0].attributes["image-url-small"];
                                }
                            }
                        });
                    }
                }
                return that.user;
            };

            this.clearUserModel = function () {
                that.user = undefined;
                storage.set("company_id", null);
            };

            this.needSignin = function () {
                if (!authService.isAuthenticated()) {
                    var path = $location.path();
                    flow.redirect(routes.user.select.url, function () {
                        flow.redirect(path);
                    });
                }
            };

            this.checkArriverUser = function (warningText, warningLabel, warningUrl) {
                if (!authService.isAuthenticated()) {
                    var path = $location.path();
                    flow.redirect(routes.user.select.url, function () {
                        flow.redirect(path);
                    });
                } else {
                    var warning = {
                        text: warningText,
                        redirect: {
                            title: warningLabel,
                            url: warningUrl
                        }
                    };

                    that.user = that.userModel();

                    if (that.user.$promise) {
                        that.user.$promise.then(function (response) {
                            var deferd = $q.defer();
                            if (that.companyId() !== null) {
                                flow.next(routes.global.warning.url, warning);
                            }
                            return deferd.promise;
                        });
                    } else {
                        if (that.companyId() !== null) {
                            flow.next(routes.global.warning.url, warning);
                        }
                    }
                }
            };

            this.checkCompanyUser = function (warningText, warningLabel, warningUrl) {
                if (!authService.isAuthenticated()) {
                    var path = $location.path();
                    flow.redirect(routes.user.selectCompany.url, function () {
                        flow.redirect(path);
                    });
                } else {
                    var warning = {
                        text: warningText,
                        redirect: {
                            title: warningLabel,
                            url: warningUrl
                        }
                    };

                    that.user = that.userModel();

                    if (that.user.$promise) {
                        that.user.$promise.then(function (response) {
                            var deferd = $q.defer();
                            if (that.companyId() === null) {
                                flow.next(routes.global.warning.url, warning);
                            }
                            return deferd.promise;
                        });
                    } else {
                        if (that.companyId() === null) {
                            flow.next(routes.global.warning.url, warning);
                        }
                    }
                }
            };

            this.userMessage = {};

        }]);
