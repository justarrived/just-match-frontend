angular.module('just.common')
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$q', '$filter', 'jobService', 'settings', 'httpPostFactory',
        function (userService, $scope, Resources, authService, flow, routes, $q, $filter, jobService, settings, httpPostFactory) {
            var that = this;

            this.isStart = 1;

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

            this.user_image = 'assets/images/content/hero.png';


            this.model.$promise.then(function (response) {
                var deferd = $q.defer();

                that.language_bundle = [];
                var found = $filter('filter')(response.included, {
                    id: "" + response.data.attributes["language-id"],
                    type: "languages"
                }, true);
                if (found.length > 0) {
                    that.language_bundle.push(found[0]);
                    that.model.data.attributes['language-id'] = '' + that.model.data.attributes['language-id'];
                }

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

            this.save = function () {
                var update_data = {};
                update_data.data = {};
                update_data.data.attributes = {};
                update_data.data.attributes.description = that.model.data.attributes.description;
                update_data.data.attributes["job-experience"] = that.model.data.attributes["job-experience"];
                update_data.data.attributes.education = that.model.data.attributes.education;
                //update_data.data.attributes["language-id"] = that.model.data.attributes["language-id"];

                //save data

                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    $scope.uploadFile();
                }

                // UPDATE USER PROFILE
                Resources.user.save({id: that.model.data.id}, update_data, function (response) {
                    //console.log(response);
                });


                // UPDATE USER LANGUAGE SKILL

                if (flow.next_data) {
                    var job_id = flow.next_data;
                    jobService.acceptJob(job_id);
                }

            };
        }])

    .controller('UserJobsArriverCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};

            that.isCompany = 0;
            $scope.jobs = jobService.getUserJobs(authService.userId().id, "job,user,job-users");

            $scope.jobs.$promise.then(function (response) {
                var deferd = $q.defer();
                $scope.jobs = [];

                angular.forEach(response.included, function (obj, key) {
                    if (obj.type === 'jobs') {
                        $scope.jobs.push(obj);
                    }
                });

                deferd.resolve($scope.jobs);
                return deferd.promise;
            });

            this.gotoUserJobPage = function (obj) {
                flow.redirect(routes.user.job_manage_arriver.resolve(obj));
            };
        }])

    .controller('UserJobsManageArriverCtrl', ['jobService', 'authService', 'justFlowService', 'justRoutes', 'userService', '$routeParams', '$scope', '$q',
        function (jobService, authService, flow, routes, userService, $routeParams, $scope, $q) {
            var that = this;
            this.maxWaitMinutes = 720; //12 hours
            this.job_user_id = null;
            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.user_apply = {};
            this.remainHours = 12;
            this.remainMinutes = 0;
            this.hasInvoice = false;
            that.isCompany = 0;

            $scope.job_obj = {id: $routeParams.id};

            userService.needSignin();

            this.model = userService.userModel();
            if (this.model.$promise) {
                this.model.$promise.then(function (response) {
                    var deferd = $q.defer();
                    that.model = response;
                    that.getJobData();
                    deferd.resolve(that.model);
                    return deferd.promise;
                });
            } else {
                that.getJobData();
            }

            this.getJobData = function () {
                $scope.job = jobService.getJob($routeParams.id, 'job-users');
                $scope.job.$promise.then(function (response) {
                    var deferd = $q.defer();

                    $scope.job = response.data;

                    deferd.resolve($scope.job);
                    return deferd.promise;
                });
            };

            // USER Accept to do a job
            this.userWillPerform = function () {
                // 260 is job_user_id have to find it in USER section
                jobService.userWillPerformJob($routeParams.id, 260, that.fn);
            };

            // USER report job finish
            this.userPerformed = function () {
                // 260 is job_user_id have to find it in USER section
                jobService.userPerformedJob($routeParams.id, 260, that.fn);
            };

            this.fn = function (result) {
                if (result === 1) {
                    that.getJobData();
                }

                // clear user accept job
                $scope.isWillPerform = false;
                $scope.modalWillPerformShow = false;

                // clear user finish job
                $scope.modalUserPerformedShow = false;
            };
        }])
    .controller('UserJobsCommentsArriverCtrl', ['jobService', 'authService', 'i18nService', 'commentService', 'justFlowService', '$routeParams', '$scope', '$q', '$filter', '$http', 'settings', 'Resources',
        function (jobService, authService, i18nService, commentService, flow, $routeParams, $scope, $q, $filter, $http, settings, Resources) {
            var that = this;
            this.model = commentService.getModel('jobs', $routeParams.id);
            this.message = {};

            $scope.job = jobService.getJob($routeParams.id);
            $scope.job.$promise.then(function (response) {
                var deferd = $q.defer();

                $scope.job = response.data;

                deferd.resolve($scope.job);
                return deferd.promise;

            });

            this.getComments = function (job_id) {
                $scope.comments = commentService.getComments('jobs', job_id, 'owner,user-images');
                $scope.comments.$promise.then(function (response) {
                    var deferd = $q.defer();
                    $scope.comments = [];
                    var curr_user_id = '0';
                    angular.forEach(response.data, function (obj, key) {
                        var found = $filter('filter')(response.included, {
                            id: "" + obj.relationships.owner.data.id,
                            type: "users"
                        }, true);
                        if (found.length > 0) {
                            obj.attributes["first-name"] = found[0].attributes["first-name"];
                            obj.attributes["last-name"] = found[0].attributes["last-name"];
                        }
                        if (authService.userId().id === obj.relationships.owner.data.id) {
                            obj.attributes.isOwner = 1;
                        } else {
                            obj.attributes.isOwner = 0;
                        }

                        /*if (curr_user_id === obj.relationships.owner.data.id) {
                         $scope.comments[$scope.comments.length - 1].attributes.body = obj.attributes.body + '<br />' + $scope.comments[$scope.comments.length - 1].attributes.body;
                         } else {
                         curr_user_id = obj.relationships.owner.data.id;
                         $scope.comments.push(obj);
                         }*/

                        $scope.comments.push(obj);

                    });
                    deferd.resolve($scope.comments);
                    return deferd.promise;
                });
            };

            this.getComments($routeParams.id);

            this.submit = function () {
                if (!that.model.data.attributes["language-id"]) {
                    //console.log(i18nService.getLanguage().id);
                    that.model.data.attributes["language-id"] = i18nService.getLanguage().id;
                }
                Resources.comments.create({
                    resource_name: "jobs",
                    resource_id: $routeParams.id
                }, that.model, function (response) {
                    that.model.data.attributes.body = "";
                    that.getComments($routeParams.id);
                });
            };
        }]);


