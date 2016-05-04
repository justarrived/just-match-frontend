angular.module('just.common')


    .controller('ArriverJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};

            that.isCompany = 0;
            $scope.jobs = jobService.getUserJobs({user_id:authService.userId().id,"include":"job,user,job-users"});

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
                flow.redirect(routes.arriver.job_manage.resolve(obj));
            };
        }])

    .controller('ArriverJobsManageCtrl', ['jobService', 'authService', 'justFlowService', 'justRoutes', 'userService', '$routeParams', '$scope', '$q',
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

                $scope.userJob = jobService.getUserJobs({
                    user_id: authService.userId().id,
                    'filter[job-id]': $routeParams.id,
                    'include': "job,user,job-users"
                });

                $scope.userJob.$promise.then(function(response){
                    var deferd = $q.defer();
                    if(response.data.length>0){
                        that.job_user_id = response.data[0].id;
                        that.accepted = response.data[0].attributes.accepted;
                        that.accepted_at = response.data[0].attributes["accepted-at"];
                        that.will_perform = response.data[0].attributes["will-perform"];
                        that.performed = response.data[0].attributes.performed;
                    }
                    return deferd.promise;
                });
            };

            // USER Accept to do a job
            this.userWillPerform = function () {
                jobService.userWillPerformJob($routeParams.id, that.job_user_id, that.fn);
            };

            // USER report job finish
            this.userPerformed = function () {
                jobService.userPerformedJob($routeParams.id, that.job_user_id, that.fn);
            };

            this.fn = function (result) {
                if (result === 1) {
                    that.getJobData();
                }
                $scope.isWillPerform = false;
                $scope.userModalPerformShow = false;
            };
        }])
    .controller('ArriverJobsCommentsCtrl', ['jobService', 'authService', 'i18nService', 'commentService', 'justFlowService', '$routeParams', '$scope', '$q', '$filter', '$http', 'settings', 'Resources',
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


