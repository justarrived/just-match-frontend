angular.module('just.common')
    .controller('CompanyJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};
            $scope.jobs_accepted = [];
            $scope.jobs_invoice = [];

            that.isCompany = 1;
            $scope.jobs = jobService.getOwnedJobs(authService.userId().id, "job,user,job-users");


            $scope.jobs.$promise.then(function (response) {
                var deferd = $q.defer();
                $scope.jobs = [];

                angular.forEach(response.data, function (obj, key) {
                    if (obj.type === 'jobs') {
                        if (obj.relationships["job-users"].data.length === 0) {
                            $scope.jobs.push(obj);
                        } else {
                            var keepGoing = true;
                            angular.forEach(obj.relationships["job-users"].data, function (obj2, key) {
                                if (keepGoing) {
                                    // has invoice
                                    var found_i = $filter('filter')(response.included, {
                                        id: "" + obj2.id,
                                        type: "job-users",
                                        attributes: {
                                            performed: true
                                        },
                                        relationships: {
                                            invoice: {
                                                data: '!null'
                                            }
                                        }
                                    }, true);
                                    if (found_i.length > 0) {

                                        keepGoing = false;
                                        Resources.jobUser.get({
                                            job_id: obj.id,
                                            id: found_i[0].id,
                                            'include': 'user,user.user-images'
                                        }, function (result) {
                                            var found_s = $filter('filter')(result.included, {
                                                id: "" + result.data.relationships.user.data.id,
                                                type: "users"
                                            }, true);

                                            if (found_s.length > 0) {
                                                obj.attributes["first-name"] = found_s[0].attributes["first-name"];
                                                obj.attributes["last-name"] = found_s[0].attributes["last-name"];
                                                obj.attributes["image-url-small"] = "assets/images/content/hero.png";

                                                if (found_s[0].relationships["user-images"].data !== null) {
                                                    var found_img = $filter('filter')(result.included, {
                                                        id: "" + found_s[0].relationships["user-images"].data[0].id,
                                                        type: "user-images"
                                                    }, true);
                                                    if (found_img.length > 0) {
                                                        obj.attributes["image-url-small"] = found_img[0].attributes["image-url-small"];
                                                    }
                                                }
                                            }
                                            $scope.jobs_invoice.push(obj);
                                        });
                                    }
                                }
                                if (keepGoing) {
                                    // ongoing
                                    var found = $filter('filter')(response.included, {
                                        id: "" + obj2.id,
                                        type: "job-users",
                                        attributes: {
                                            accepted: true,
                                            "will-perform": true,
                                        },
                                        relationships: {
                                            invoice: {
                                                data: null
                                            }
                                        }
                                    }, true);
                                    if (found.length > 0) {
                                        $scope.jobs_accepted.push(obj);
                                        keepGoing = false;
                                    }
                                }
                            });
                            if (keepGoing) {
                                // wait owner
                                $scope.jobs.push(obj);
                                keepGoing = false;
                            }
                        }
                    }
                });

                deferd.resolve($scope.jobs);
                return deferd.promise;
            });

            this.gotoUserJobPage = function (obj) {
                flow.redirect(routes.company.job_manage.resolve(obj));
            };
        }])
    .controller('CompanyJobsManageCtrl', ['jobService', 'authService', 'invoiceService', 'ratingService', 'justFlowService', 'justRoutes', 'userService', '$routeParams', '$scope', '$q', '$filter', 'MyDate', '$interval',
        function (jobService, authService, invoiceService, ratingService, flow, routes, userService, $routeParams, $scope, $q, $filter, MyDate, $interval) {
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
            that.isCompany = -1;

            $scope.job_obj = {id: $routeParams.id};
            this.ratingModel = ratingService.ratingModel;

            userService.needSignin();

            this.model = userService.userModel();
            if (this.model.$promise) {
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
                if (userService.companyId() !== null) {
                    that.isCompany = 1;
                } else {
                    that.isCompany = 0;
                }
                that.getJobData();
            }

            this.gotoAcceptedCandidate = function () {
                flow.redirect(routes.company.job_candidate.resolve($routeParams.id, that.job_user_id));
            };

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

            this.getJobData = function () {
                $scope.job_user = jobService.getJobUsers($routeParams.id, 'job,user,user-images');
                $scope.job_user.$promise.then(function (response) {
                    var deferd = $q.defer();

                    var found = $filter('filter')(response.included, {
                        id: "" + $routeParams.id,
                        type: "jobs"
                    }, true);

                    angular.forEach(response.data, function (obj, idx) {
                        if (obj.attributes.accepted) {
                            that.job_user_id = obj.id;
                            that.accepted = true;
                            that.accepted_at = obj.attributes["accepted-at"];

                            var found_user = $filter('filter')(response.included, {
                                id: "" + obj.relationships.user.data.id,
                                type: "users"
                            }, true);

                            that.user_apply = found_user[0];
                            that.ratingModel.data.attributes["user-id"] = parseInt(obj.relationships.user.data.id);

                        }
                        if (obj.attributes["will-perform"]) {
                            that.will_perform = true;
                        } else {
                            if (that.accepted) {
                                that.calcRemainTime();
                            }
                        }
                        if (obj.attributes.performed) {
                            that.performed = true;

                            if (obj.relationships.invoice.data !== null) {
                                that.hasInvoice = true;
                            } else {
                                that.hasInvoice = false;
                            }
                        }
                    });
                    console.log("zz");
                    //Calculate remain time
                    if (that.accepted && !that.will_perform) {
                        if (that.calcRemainTime() > 0) {
                            var interval = $interval(function () {
                                if (that.calcRemainTime() <= 0) {
                                    console.log("remain time < 0");
                                    //$interval.cancel(interval);
                                }
                            }, 6000);
                        }
                    }

                    if (found) {
                        if (found.length > 0) {
                            $scope.job = found[0];
                        }
                    } else {
                        $scope.job = jobService.getJob($routeParams.id);
                        $scope.job.$promise.then(function (response) {
                            var deferd = $q.defer();

                            $scope.job = response.data;

                            deferd.resolve($scope.job);
                            return deferd.promise;

                        });
                    }
                    console.log(that);
                    deferd.resolve($scope.job);
                    return deferd.promise;
                });


            };

            this.ownerCancelPerformed = function () {
                jobService.userCancelPerformedJob($routeParams.id, that.job_user_id, that.fn);
            };

            this.createInvoice = function () {
                invoiceService.createInvoice($routeParams.id, that.job_user_id, that.submitJobRating);
            };

            this.submitJobRating = function () {
                ratingService.submitRating($routeParams.id, that.ratingModel, that.fn);
            };

            this.fn = function (result) {
                if (result === 1) {
                    that.getJobData();
                }

                // clear owner create invoice
                $scope.isPerformed = false;
                $scope.modalPerformShow = false;
            };
        }])
    .controller('CompanyJobsCommentsCtrl', ['jobService', 'authService', 'i18nService', 'commentService', 'justFlowService', '$routeParams', '$scope', '$q', '$filter', '$http', 'settings', 'Resources',
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
        }])
    .controller('CompanyJobsCandidatesCtrl', ['jobService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter',
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

                var found1 = $filter('filter')(response.included, {
                    id: "" + that.job_id,
                    type: "jobs"
                }, true);

                if (found1.length > 0) {
                    $scope.job = found1[0];
                }

                deferd.resolve($scope.job_users);
                return deferd.promise;

            });
        }])
    .controller('CompanyJobsCandidateCtrl', ['jobService', 'invoiceService', 'ratingService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter', 'MyDate', '$interval',
        function (jobService, invoiceService, ratingService, flow, userService, $routeParams, $scope, $q, $filter, MyDate, $interval) {
            var that = this;
            this.job_id = $routeParams.job_id;
            this.job_user_id = $routeParams.job_user_id;
            this.candidate_model = {};
            $scope.currTab = 1;
            $scope.modalShow = false;
            //$scope.job_status_title = "Amir har sokt uppdraget";
            //$scope.isAccepted = false;
            this.isCompany = -1;

            this.maxWaitMinutes = 720; //12 hours
            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.remainHours = 12;
            this.remainMinutes = 0;
            this.hasInvoice = false;

            this.ratingModel = ratingService.ratingModel;


            if (userService.companyId()) {
                this.isCompany = 1;
            }


            this.getJobData = function () {
                that.model = jobService.getJobUser(that.job_id, that.job_user_id, 'job,user,user.user-images');
                that.model.$promise.then(function (response) {
                    var deferd = $q.defer();

                    that.candidate_model = {};
                    var found = $filter('filter')(response.included, {
                        id: "" + response.data.relationships.user.data.id,
                        type: "users"
                    }, true);

                    if (found.length > 0) {
                        that.candidate_model = found[0].attributes;
                        that.ratingModel.data.attributes["user-id"] = parseInt(found[0].id);
                    }

                    if (userService.companyId()) {
                        that.isCompany = 1;
                    }
                    if (response.data.attributes.accepted) {
                        that.accepted = true;
                        that.accepted_at = response.data.attributes["accepted-at"];

                    }

                    if (response.data.attributes["will-perform"]) {
                        that.will_perform = true;
                    } else {
                        if (that.accepted) {
                            that.calcRemainTime();
                        }
                    }

                    if (response.data.attributes.performed) {
                        that.performed = true;
                    }

                    if (response.data.relationships.invoice.data !== null) {
                        that.hasInvoice = true;
                    } else {
                        that.hasInvoice = false;
                    }

                    //Calculate remain time
                    if (that.accepted && !that.will_perform) {
                        if (that.calcRemainTime() > 0) {
                            var interval = $interval(function () {
                                if (that.calcRemainTime() <= 0) {
                                    console.log("remainTime < 0");
                                    //$interval.cancel(interval);
                                }
                            }, 6000);
                        }
                    }

                    deferd.resolve(that.candidate_model);
                    return deferd.promise;
                });
            };

            this.getJobData();


            this.acceptJob = function () {
                jobService.ownerAcceptJob(that.job_id, that.job_user_id, that.fn);
            };

            this.ownerCancelPerformed = function () {
                jobService.userCancelPerformedJob(that.job_id, that.job_user_id, that.fn);
            };

            this.createInvoice = function () {
                invoiceService.createInvoice(that.job_id, that.job_user_id, that.submitJobRating);
            };

            this.submitJobRating = function () {
                ratingService.submitRating(that.job_id, that.ratingModel, that.fn);
            };

            this.fn = function (result) {
                if (result === 1) {
                    that.getJobData();
                }
                $scope.modalShow = false;

                // clear owner create invoice
                $scope.isPerformed = false;
                $scope.modalPerformShow = false;
            };

            this.calcRemainTime = function () {
                var acceptedDate = new MyDate(new Date());
                acceptedDate.setISO8601(that.accepted_at);
                var nowDate = new Date();
                var diffMs = (nowDate - acceptedDate.date);
                var diffMins = Math.round(diffMs / 60000); // minutes
                var remainTime = that.maxWaitMinutes - diffMins;
                that.remainHours = Math.floor((remainTime) / 60);
                that.remainMinutes = remainTime - (that.remainHours * 60);
                if (remainTime <= 0) {
                    console.log("remainTime < 0");
                    /*that.accepted = false;
                    that.accepted_at = null;*/
                }
                return remainTime;
            };


        }]);

