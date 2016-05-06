angular.module('just.common')


    .controller('ArriverJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};

            that.isCompany = 0;

            userService.checkArriverUser("Available for Arriver user", "Back to Home", routes.global.start.url);

            $scope.jobbs = jobService.getUserJobs({user_id: authService.userId().id, "include": "job"});
            $scope.jobbs.$promise.then(function (response) {
                $scope.jobs = response.included;

                angular.forEach($scope.jobs, function (obj, key) {


                        var found = $filter('filter')(response.data, {relationships: {job: {data: {id: "" + obj.id}}}}, true);
                        if (found.length > 0) {
                            $scope.jobs[key]["job-users"] = found[0];
                            if (!found[0].attributes.accepted && !found[0].attributes["will-perform"]) {
                                $scope.jobs[key].attributes.text_status = "Du har sökt uppdraget";
                            }
                            if (found[0].attributes.accepted && !found[0].attributes["will-perform"]) {
                                Resources.job.get({id: "" + obj.id, 'include': 'company'}, function (result) {
                                    $scope.jobs[key].attributes.text_status=result.included[0].attributes.name+" vill anlita dig";
                                });
                            }
                            if(found[0].attributes["will-perform"]){
                                $scope.jobs[key].attributes.text_status = "Du är anlitad";
                            }
                        }

                });
            });

            this.gotoUserJobPage = function (obj) {
                flow.redirect(routes.arriver.job_manage.resolve(obj));
            };
        }])

    .controller('ArriverJobsManageCtrl', ['jobService', 'authService', 'justFlowService', 'justRoutes', 'userService', '$routeParams',
        '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources',
        function (jobService, authService, flow, routes, userService, $routeParams, $scope, $q, $filter, MyDate, $interval, Resources) {
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
            this.isCompany = 0;
            this.canPerformed = false;
            this.showStatus = false;

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

            this.calcRemainTime = function () {
                var acceptedDate = new MyDate(new Date());
                acceptedDate.setISO8601(that.accepted_at);
                var nowDate = new Date();
                var diffMs = (nowDate - acceptedDate.date);
                var diffMins = Math.round(diffMs / 60000); // minutes
                var remainTime = that.maxWaitMinutes - diffMins;
                that.remainHours = Math.floor((remainTime) / 60);
                that.remainMinutes = remainTime - (that.remainHours * 60);
                /*if (remainTime <= 0) {
                 jobService.ownerCancelAcceptJob($routeParams.id, that.job_user_id);
                 that.job_user_id = null;
                 that.accepted = false;
                 that.accepted_at = null;
                 that.user_apply = {};
                 }*/
                return remainTime;
            };

            this.checkJobDate = function (job_date) {
                var jobDate = new MyDate(new Date());
                jobDate.setISO8601(job_date);
                var nowDate = new Date();

                if (nowDate < jobDate.date) {
                    return false;
                } else {
                    return true;
                }
            };

            this.getJobData = function () {
                $scope.jobb = jobService.getJob($routeParams.id, 'company');
                $scope.jobb.$promise.then(function (response) {
                    $scope.job = response.data;
                    $scope.job.company = response.included[0];
                    that.canPerformed = that.checkJobDate(response.data.attributes["job-date"]);
                    $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                    var company_image_arr = response.included[0].relationships["company-images"].data;
                    if (company_image_arr.length > 0) {
                        Resources.companyImage.get({
                            company_id: "" + response.included[0].id,
                            id: company_image_arr[0].id
                        }, function (resultImage) {
                            $scope.job.company_image = resultImage.data.attributes["image-url-small"];
                        });
                    }
                });

                $scope.userJob = jobService.getUserJobs({
                    user_id: authService.userId().id,
                    'filter[job-id]': $routeParams.id,
                    'include': "job,user,job-users"
                });

                $scope.userJob.$promise.then(function (response) {
                    var deferd = $q.defer();
                    if (response.data.length > 0) {
                        that.job_user_id = response.data[0].id;
                        that.accepted = response.data[0].attributes.accepted;
                        that.accepted_at = response.data[0].attributes["accepted-at"];
                        that.will_perform = response.data[0].attributes["will-perform"];
                        that.performed = response.data[0].attributes.performed;

                        if (!that.will_perform && that.accepted) {
                            that.calcRemainTime();
                        }

                        if (that.performed) {
                            if (response.data[0].relationships.invoice.data !== null) {
                                that.hasInvoice = true;
                            } else {
                                that.hasInvoice = false;
                            }
                        }
                    }
                    //Calculate remain time
                    if (that.accepted && !that.will_perform) {
                        if (that.calcRemainTime() > 0) {
                            var interval = $interval(function () {
                                that.calcRemainTime();
                                /*if (that.calcRemainTime() <= 0) {
                                 //$interval.cancel(interval);
                                 }*/
                            }, 6000);
                        }
                    }
                    that.showStatus = true;
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

            $scope.jobb = jobService.getJob($routeParams.id, 'company,hourly-pay');
            $scope.jobb.$promise.then(function (response) {
                $scope.job = response.data;
                $scope.job.company = response.included[0];
                $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                var found_hourly_pay = $filter('filter')(response.included, {
                    id: "" + response.data.relationships["hourly-pay"].data.id,
                    type: "hourly-pays"
                }, true);

                if (found_hourly_pay.length > 0) {
                    $scope.job.hourly_pay = found_hourly_pay[0].attributes;
                    $scope.job.max_rate = found_hourly_pay[0].attributes.rate * response.data.attributes.hours;
                }

                var company_image_arr = response.included[0].relationships["company-images"].data;
                if (company_image_arr.length > 0) {
                    Resources.companyImage.get({
                        company_id: "" + response.data.relationships.company.data.id,
                        id: company_image_arr[0].id
                    }, function (resultImage) {
                        $scope.job.company_image = resultImage.data.attributes["image-url-small"];
                    });
                }
            });

            this.getComments = function (job_id) {
                $scope.commentss = commentService.getComments('jobs', job_id, 'owner,user-images');
                $scope.commentss.$promise.then(function (response) {
                    $scope.comments = response.data;
                    angular.forEach(response.data, function (obj, key) {
                        var found = $filter('filter')(response.included, {
                            id: "" + obj.relationships.owner.data.id,
                            type: "users"
                        }, true);
                        if (found.length > 0) {
                            $scope.comments[key].attributes["first-name"] = found[0].attributes["first-name"];
                            $scope.comments[key].attributes["last-name"] = found[0].attributes["last-name"];
                        }
                        if (authService.userId().id === obj.relationships.owner.data.id) {
                            $scope.comments[key].attributes.isOwner = 1;
                        } else {
                            $scope.comments[key].attributes.isOwner = 0;
                        }
                        $scope.comments[key].user_image = "assets/images/content/placeholder-profile-image.png";

                        if (found[0].relationships["user-images"].data.length > 0) {
                            Resources.userImageId.get({
                                user_id: obj.relationships.owner.data.id,
                                id: found[0].relationships["user-images"].data[0].id
                            },function(result){
                                $scope.comments[key].user_image = result.data.attributes["image-url-small"];
                            });
                        }

                    });
                });
            };

            this.getComments($routeParams.id);

            this.submit = function () {
                if (!that.model.data.attributes["language-id"]) {
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


