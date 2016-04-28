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
    .controller('UserJobsCtrl', ['authService', 'userService', 'jobService', '$scope', '$q', function (authService, userService, jobService, $scope, $q) {
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
    }])
    .controller('UserJobsManageCtrl', ['jobService', 'userService', '$routeParams', '$scope', '$q','$filter', function (jobService, userService, $routeParams, $scope, $q,$filter) {
        var that = this;

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
        }else{
            this.getJobData();
        }

        this.getJobData = function(){
            if(that.isCompany===1){
                $scope.job_user = jobService.getJobUsers($routeParams.id, 'job,user,user-images');
                $scope.job_user.$promise.then(function (response) {
                    var deferd = $q.defer();

                    var found = $filter('filter')(response.included, {
                        id: "" + $routeParams.id,
                        type: "jobs"
                    }, true);

                    if(found.length > 0){
                        $scope.job = found[0];
                    }

                    deferd.resolve($scope.job);
                    return deferd.promise;

                });
            }else{
                $scope.job = jobService.getJob($routeParams.id);
                $scope.job.$promise.then(function (response) {
                    var deferd = $q.defer();

                    $scope.job = response.data;

                    deferd.resolve($scope.job);
                    return deferd.promise;

                });
            }
        };

    }]);
