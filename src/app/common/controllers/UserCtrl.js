angular.module('just.common')
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$q', '$filter', 'jobService', 'settings', 'httpPostFactory',
        function (userService, $scope, Resources, authService, flow, routes, $q, $filter, jobService, settings, httpPostFactory) {
            var that = this;

            this.isStart = 1;
            this.saveSuccessFromRegister = 0;
            this.saveSuccessFromJobApply = 0;

            if (!authService.isAuthenticated()) {
                flow.redirect(routes.user.select.url, function () {
                    flow.redirect(routes.user.user.url);
                });
            }

            this.model = {};
            this.model.data = {};
            this.model.data.attributes = {};

            this.model = userService.userModel();
            this.message = userService.userMessage;

            this.user_image = 'assets/images/content/placeholder-profile-image.png';


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


            $scope.languagesArr = [];

            $scope.languagesArrFn = function (query, querySelectAs) {
                var deferd = $q.defer();

                if(query!==''){
                    angular.element(".select-search-list-item_loader").show();
                    $scope.languages = Resources.languages.get({
                        'page[number]': 1,
                        'page[size]': 50,
                        'sort': 'en-name',
                        'filter[name]': query
                    });

                    $scope.languages.$promise.then(function (response) {
                        $scope.languagesArr = response;
                        var result = [];
                        angular.forEach(response.data, function (obj, key) {
                            result.push(obj);
                        });
                        deferd.resolve(result);
                    });
                }else{
                    angular.element(".select-search-list-item_loader").hide();
                }

                return deferd.promise;
            };

            $scope.uploadFile = function () {
                var formData = new FormData();

                var element = angular.element("#file_upload");

                formData.append("image", element[0].files[0]);
                httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                    var image_token = {};
                    image_token.data = {};
                    image_token.data.attributes = {};
                    image_token.data.attributes["user-image-one-time-token"] = callback.data.attributes["one-time-token"];
                    Resources.user.save({id: that.model.data.id}, image_token, function (response) {
                        //console.log(response);
                    });
                });
            };

            /*Image upload and submit*/
            this.image = {};
            this.language_new = [];
            this.language_remove = [];

            this.processLanguages = function () {
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

                that.removeLanguage();
            };

            this.removeLanguage = function () {
                if (that.language_remove.length > 0) {
                    Resources.userLanguageId.remove({
                        user_id: "" + that.model.data.id,
                        user_language_id: "" + that.language_remove[0].user_language_id
                    }, function (result) {
                        that.language_remove.shift();
                        that.removeLanguage();
                    }, function (result) {
                        that.language_remove.shift();
                        that.removeLanguage();
                    });
                }
            };

            this.newLanguage = function () {
                if (that.language_new.length > 0) {
                    var data = {
                            data: {
                                attributes: {
                                    id: that.language_new[0].id
                                }
                            }
                        }
                        ;
                    Resources.userLanguage.create({user_id: that.model.data.id}, data,
                        function (result) {
                            that.language_new.shift();
                            that.newLanguage();
                        }, function (result) {
                            that.language_new.shift();
                            that.newLanguage();

                        });
                }
            };

            this.save = function () {
                var update_data = {};
                update_data.data = {};
                update_data.data.attributes = {};
                update_data.data.attributes.description = that.model.data.attributes.description;
                update_data.data.attributes["job-experience"] = that.model.data.attributes["job-experience"];
                update_data.data.attributes.education = that.model.data.attributes.education;
                //update_data.data.attributes["language-id"] = that.model.data.attributes["language-id"];

                //save data

                // UPDATE USER LANGUAGE SKILL
                that.processLanguages();

                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    $scope.uploadFile();
                }

                // UPDATE USER PROFILE
                Resources.user.save({id: that.model.data.id}, update_data, function (response) {
                    if (flow.next_data) {
                        var job_id = flow.next_data.job_id;
                        if(flow.next_data.type==='apply_job'){
                            jobService.acceptJob(job_id, that.showAppliedJob);
                        }else if(flow.next_data.type==='arriver_user_register'){
                            that.saveSuccessFromRegister = 1;
                        }
                    }
                });
            };

            this.showAppliedJob = function () {
                that.saveSuccessFromJobApply = 1;
            };

            this.gotoJobList = function () {
                flow.redirect(routes.job.list.url);
            };
        }]);


