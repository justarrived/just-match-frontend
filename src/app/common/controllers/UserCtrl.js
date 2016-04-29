angular.module('just.common')
    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        };
    }])
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$q', '$filter', 'jobService',
        function (userService, $scope, Resources, authService, flow, routes, $q, $filter, jobService) {
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

                deferd.resolve(that.language_bundle);
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
                if ($scope.vm) {
                    Resources.userImage.upload({
                            image: $scope.vm.uploadme,
                            data: {
                                attributes: {
                                    image: $scope.vm.uploadme
                                }
                            }
                        },
                        function (response) {
                            console.log("upload image");
                            console.log(response);
                        }
                    );
                }


                // UPDATE USER PROFILE
                Resources.users.update(update_data, function (response) {
                    console.log(response);
                });


                // UPDATE USER LANGUAGE SKILL

                if (flow.next_data) {
                    var job_id = flow.next_data;
                    jobService.acceptJob(job_id);
                }

            };
        }])
    .controller('UserJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', function (authService, flow, routes, userService, jobService, $scope, $q) {
        var that = this;

        this.model = userService.userModel();
        this.message = userService.userMessage;
        $scope.jobs = {};

        this.isCompany = -1;

        this.model.$promise.then(function (response) {
            var deferd = $q.defer();

            that.model = response;
            if (response.data.relationships.company.data !== null) {
                that.isCompany = 1;
                $scope.jobs = jobService.getJobsPage({'page[number]': 1, 'page[size]': 50});
            } else {
                that.isCompany = 0;
                $scope.jobs = jobService.getUserJobs(authService.userId().id, "job,user");
            }

            $scope.jobs.$promise.then(function (response) {
                var deferd = $q.defer();
                $scope.jobs = [];
                if (that.isCompany === 1) {
                    angular.forEach(response.data, function (obj, key) {
                        if (obj.relationships.owner.data.id === authService.userId().id) {
                            $scope.jobs.push(obj);
                        }
                    });
                } else {
                    angular.forEach(response.included, function (obj, key) {
                        if (obj.type === 'jobs') {
                            $scope.jobs.push(obj);
                        }
                    });
                }
                deferd.resolve($scope.jobs);
                return deferd.promise;
            });

            deferd.resolve(that.model);
            return deferd.promise;
        });

        this.gotoUserJobPage = function (obj) {
            flow.redirect(routes.user.job_manage.resolve(obj));
        };
    }])
    .controller('UserJobsManageCtrl', ['jobService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter', function (jobService, flow, userService, $routeParams, $scope, $q, $filter) {
        var that = this;

        $scope.job_obj = {id: $routeParams.id};

        if (userService.isCompany === -1) {
            this.model = userService.userModel();

            this.model.$promise.then(function (response) {
                var deferd = $q.defer();

                that.model = response;

                if (response.data.relationships.company.data !== null) {
                    that.isCompany = 1;
                } else {
                    that.isCompany = 0;
                }

                that.getJobData();

                deferd.resolve(that.model);
                return deferd.promise;

            });
        } else {
            this.getJobData();
        }

        this.getJobData = function () {
            if (that.isCompany === 1) {
                $scope.job_user = jobService.getJobUsers($routeParams.id, 'job,user,user-images');
                $scope.job_user.$promise.then(function (response) {
                    var deferd = $q.defer();

                    var found = $filter('filter')(response.included, {
                        id: "" + $routeParams.id,
                        type: "jobs"
                    }, true);

                    if (found.length > 0) {
                        $scope.job = found[0];
                    }

                    deferd.resolve($scope.job);
                    return deferd.promise;

                });
            } else {
                $scope.job = jobService.getJob($routeParams.id);
                $scope.job.$promise.then(function (response) {
                    var deferd = $q.defer();

                    $scope.job = response.data;

                    deferd.resolve($scope.job);
                    return deferd.promise;

                });
            }
        };

    }])
    .controller('UserJobsCommentsCtrl', ['jobService', 'commentService', 'justFlowService', '$routeParams', '$scope', '$q', '$filter', '$http', 'settings',
        function (jobService, commentService, flow, $routeParams, $scope, $q, $filter, $http, settings) {
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
                $scope.comments = commentService.getComments('jobs', job_id, 'owner');
                $scope.comments.$promise.then(function (response) {
                    var deferd = $q.defer();

                    $scope.comments = [];
                    angular.forEach(response.data, function (obj, key) {
                        var found = $filter('filter')(response.included, {
                            id: "" + obj.relationships.owner.data.id,
                            type: "users"
                        }, true);
                        if (found.length > 0) {
                            obj.attributes["first-name"] = found[0].attributes["first-name"];
                            obj.attributes["last-name"] = found[0].attributes["last-name"];
                        }
                        $scope.comments.push(obj);
                    });
                    console.log($scope.comments);
                    deferd.resolve($scope.comments);
                    return deferd.promise;
                });
            };

            this.getComments($routeParams.id);

            this.submit = function () {
                $http.post(settings.just_match_api + settings.just_match_api_version + "jobs/" + $routeParams.id + "/comments", that.model)
                    .success(function (data, status) {
                        that.model.data.attributes.body = "";
                        that.getComments($routeParams.id);
                    }).error(function (data, status) {
                    that.message = data;
                });
            };
        }])
    .controller('UserJobsCandidatesCtrl', ['jobService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter',
        function (jobService, flow, userService, $routeParams, $scope, $q, $filter) {
            var that = this;
            this.job_id = $routeParams.id;

            $scope.candidates = [];

            $scope.job_users = jobService.getJobUsers($routeParams.id, 'job,user,user-images');
            $scope.job_users.$promise.then(function (response) {
                var deferd = $q.defer();

                $scope.job_users = [];
                angular.forEach(response.data, function (obj, key) {
                    var found = $filter('filter')(response.included, {
                        id: "" + obj.relationships.user.data.id,
                        type: "users"
                    }, true);

                    if (found.length > 0) {
                        obj.attributes["first-name"] = found[0].attributes["first-name"];
                        obj.attributes["last-name"] = found[0].attributes["last-name"];
                    }

                    $scope.job_users.push(obj);
                });

                /*var found = $filter('filter')(response.included, {
                 id: "" + $routeParams.id,
                 type: "jobs"
                 }, true);

                 if (found.length > 0) {
                 $scope.job = found[0];
                 }

                 $scope.candidates = $filter('filter')(response.included, {type: "users"}, true);*/

                deferd.resolve($scope.job_users);
                return deferd.promise;

            });
        }])
    .controller('UserJobsCandidateCtrl', ['jobService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter',
        function (jobService, flow, userService, $routeParams, $scope, $q, $filter) {
            var that = this;
            this.job_id = $routeParams.job_id;
            this.job_user_id = $routeParams.job_user_id;
            this.candidate_model = {};
            $scope.currTab = 1;
            $scope.modalShow = false;

            this.model = jobService.getJobUser(this.job_id, this.job_user_id, 'job,user,user.user-images');
            this.model.$promise.then(function (response) {
                var deferd = $q.defer();

                this.candidate_model = {};
                var found = $filter('filter')(response.included, {
                    id: "" + response.data.relationships.user.data.id,
                    type: "users"
                }, true);

                if (found.length > 0) {
                    that.candidate_model = found[0].attributes;
                }

                deferd.resolve(that.candidate_model);
                return deferd.promise;
            });

        }]);

