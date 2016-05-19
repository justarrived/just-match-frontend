angular.module('just.common')
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$location', '$q', '$filter', 'jobService', 'settings', 'httpPostFactory',
        function (userService, $scope, Resources, authService, flow, routes, $location, $q, $filter, jobService, settings, httpPostFactory) {
            var that = this;

            this.isStart = 1;
            //this.saveSuccessFromRegister = 0;
            //this.saveSuccessFromJobApply = 0;
            //this.saveSuccessDefault = 0;
            this.saveButtonText = "common.save";

            if (!authService.isAuthenticated()) {
                flow.redirect(routes.user.select.url, function () {
                    flow.redirect(routes.user.user.url);
                });
            }else{
                userService.checkArriverUser();
            }

            this.model = {};
            this.model.data = {};
            this.model.data.attributes = {};

            if(flow.next_data){
                if(flow.next_data.type === 'apply_job' || flow.next_data.type === 'arriver_user_register'){
                    this.saveButtonText = "common.continue";
                }
            }


            if (authService.isAuthenticated()) {
                this.model = userService.userModel();
                this.message = userService.userMessage;

                this.user_image = 'assets/images/content/placeholder-profile-image.png';

                if (this.model.$promise) {
                    this.model.$promise.then(function (response) {
                        var deferd = $q.defer();

                        that.language_bundle = [];
                        that.language_ori = [];
                        var found = $filter('filter')(response.included, {
                            type: "languages"
                        }, true);

                        angular.forEach(found, function (obj, idx) {
                            that.language_bundle.push(found[idx]);
                            that.language_ori.push(found[idx]);
                        });

                        Resources.userLanguage.get({user_id: that.model.data.id}, function (result) {
                            angular.forEach(result.data, function (obj, idx) {
                                angular.forEach(that.language_bundle, function (obj2, idx2) {
                                    if (obj.relationships.language.data.id === obj2.id) {
                                        that.language_bundle[idx2].user_language_id = obj.id;
                                        that.language_ori[idx2].user_language_id = obj.id;
                                    }
                                });
                            });
                        });

                        var found_img = $filter('filter')(response.included, {
                            type: 'user-images'
                        }, true);
                        if (found_img.length > 0) {
                            that.user_image = found_img[0].attributes["image-url-small"];
                        }

                        deferd.resolve(that.language_bundle);
                        deferd.resolve(that.user_image);
                        return deferd.promise;
                    });
                }


                $scope.languagesArr = [];

                $scope.languagesArrFn = function (query, querySelectAs) {
                    var deferd = $q.defer();

                    if (query !== '') {
                        angular.element(".select-search-list-item_loader").show();
                        $scope.languages = Resources.languages.get({
                            'page[number]': 1,
                            'page[size]': 50,
                            'sort': 'en-name',
                            'filter[en-name]': query
                        });

                        $scope.languages.$promise.then(function (response) {
                            $scope.languagesArr = response;
                            var result = [];
                            angular.forEach(response.data, function (obj, key) {
                                result.push(obj);
                            });
                            deferd.resolve(result);
                        });
                    } else {
                        angular.element(".select-search-list-item_loader").hide();
                    }

                    return deferd.promise;
                };
            }


            /*Image upload and submit*/
            this.image = {};
            this.language_new = [];
            this.language_remove = [];

            this.processLanguages = function (fn) {
                that.language_new = [];
                that.language_remove = [];

                angular.forEach(that.language_bundle, function (obj, key) {
                    var found = $filter('filter')(that.language_ori, {id: "" + obj.id}, true);
                    if (found.length === 0) {
                        that.language_new.push(obj);
                    }
                });

                angular.forEach(that.language_ori, function (obj, key) {
                    var found = $filter('filter')(that.language_bundle, {id: "" + obj.id}, true);
                    if (found.length === 0) {
                        that.language_remove.push(obj);
                    }
                });

                that.removeLanguage(fn);
            };

            this.removeLanguage = function (fn) {
                if (that.language_remove.length > 0) {
                    Resources.userLanguageId.remove({
                        user_id: "" + that.model.data.id,
                        user_language_id: "" + that.language_remove[0].user_language_id
                    }, function (result) {
                        that.language_remove.shift();
                        that.removeLanguage(fn);
                    }, function (result) {
                        that.language_remove.shift();
                        that.removeLanguage(fn);
                    });
                } else {
                    that.newLanguage(fn);
                }
            };

            this.newLanguage = function (fn) {
                if (that.language_new.length > 0) {
                    var data = {
                        data: {
                            attributes: {
                                id: that.language_new[0].id
                            }
                        }
                    };
                    Resources.userLanguage.create({user_id: that.model.data.id}, data,
                        function (result) {
                            that.language_new.shift();
                            that.newLanguage(fn);
                        }, function (result) {
                            that.language_new.shift();
                            that.newLanguage(fn);

                        });
                } else {
                    if (fn) {
                        fn();
                    }
                }
            };


            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");

                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.model.data.attributes['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                    });
                }

            };

            this.getLanguages = function () {

                userService.clearUserModel();
                that.model = userService.userModel();
                that.model.$promise.then(function (response) {
                    that.language_bundle = [];
                    that.language_ori = [];

                    var found = $filter('filter')(response.included, {
                        type: "languages"
                    }, true);

                    angular.forEach(found, function (obj, idx) {
                        that.language_bundle.push(found[idx]);
                        that.language_ori.push(found[idx]);
                    });

                    Resources.userLanguage.get({user_id: that.model.data.id}, function (result) {
                        angular.forEach(result.data, function (obj, idx) {
                            angular.forEach(that.language_bundle, function (obj2, idx2) {
                                if (obj.relationships.language.data.id === obj2.id) {
                                    that.language_bundle[idx2].user_language_id = obj.id;
                                    that.language_ori[idx2].user_language_id = obj.id;
                                }
                            });


                        });
                    });

                });
            };

            this.save = function () {
                // UPDATE USER LANGUAGE SKILL
                that.processLanguages(that.saveProfile);
            };

            this.saveProfile = function () {
                var update_data = {};
                update_data.data = {};
                update_data.data.attributes = {};
                update_data.data.attributes.description = that.model.data.attributes.description;
                update_data.data.attributes["job-experience"] = that.model.data.attributes["job-experience"];
                update_data.data.attributes.education = that.model.data.attributes.education;
                update_data.data.attributes["competence-text"] = that.model.data.attributes["competence-text"];
                if (that.model.data.attributes['user-image-one-time-token']) {
                    update_data.data.attributes["user-image-one-time-token"] = that.model.data.attributes["user-image-one-time-token"];
                }
                //update_data.data.attributes["language-id"] = that.model.data.attributes["language-id"];

                // UPDATE USER PROFILE
                Resources.user.save({id: that.model.data.id}, update_data, function (response) {
                    /*
                     if (flow.next_data) {
                     var job_id = flow.next_data.job_id;
                     if (flow.next_data.type === 'apply_job') {
                     jobService.acceptJob(job_id, that.showAppliedJob);
                     } else if (flow.next_data.type === 'arriver_user_register') {
                     that.saveSuccessFromRegister = 1;
                     }
                     } else {
                     that.saveSuccessDefault = 1;
                     }*/


                    if (flow.next_data) {
                        if (flow.next_data.from_route && (flow.next_data.from_route === routes.global.start.url)) {
                            //from menu
                            flow.push(function () {
                                flow.completed(routes.global.start.url);
                            });
                            flow.next(routes.global.confirmation.url, {
                                title: 'common.updated',
                                description: 'profile.updated',
                                submit: 'common.back'
                            });
                        } else if (flow.next_data) {
                            //from apply job, register
                            var job_id = flow.next_data.job_id;
                            if (flow.next_data.type === 'apply_job') {
                                jobService.acceptJob(job_id, that.showAppliedJob);
                            } else if (flow.next_data.type === 'arriver_user_register') {
                                //that.saveSuccessFromRegister = 1;

                                flow.push(function () {
                                    flow.completed(routes.job.list.url);
                                });
                                flow.next(routes.global.confirmation.url, {
                                    title: 'profile.create.confirmation.title',
                                    description: 'profile.create.confirmation.description',
                                    submit: 'common.find_assignment'
                                });
                            }
                        }
                    } else {
                        flow.push(function () {
                            flow.completed(routes.user.user.url);
                        });
                        flow.next(routes.global.confirmation.url, {
                            title: 'common.updated',
                            description: 'profile.updated',
                            submit: 'common.back'
                        });
                    }
                    /* else {
                     that.saveSuccessDefault = 1;
                     }*/
                });
            };

            this.showAppliedJob = function () {
                //that.saveSuccessFromJobApply = 1;

                flow.push(function () {
                    flow.completed(routes.job.list.url);
                });
                flow.next(routes.global.confirmation.url, {
                    title: 'assignment.status.applied',
                    description: 'assignment.status.applied.description',
                    submit: 'user.apply.find_more'
                });
            };

            this.gotoJobList = function () {
                flow.redirect(routes.job.list.url);
            };

            this.refreshPage = function () {
                that.getLanguages();
                var path = $location.path();
                flow.redirect(path);
                that.saveSuccessDefault = 0;
            };
        }]);


