angular.module('just.common')
    .controller('CompanyJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};
            $scope.jobs_accepted = [];
            $scope.jobs_invoice = [];

            userService.checkCompanyUser("Available for Company user", "Back to Home", routes.global.start.url);

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
                                                obj.attributes["image-url-small"] = "assets/images/content/placeholder-profile-image.png";

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
    .controller('CompanyJobsManageCtrl', ['jobService', 'authService', 'invoiceService', 'ratingService', 'justFlowService', 'justRoutes', 'userService', '$routeParams',
        '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources',
        function (jobService, authService, invoiceService, ratingService, flow, routes, userService, $routeParams, $scope, $q, $filter, MyDate, $interval, Resources) {
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
            this.showStatus = false;

            $scope.job_obj = {id: $routeParams.id};
            this.ratingModel = ratingService.ratingModel;

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

                $scope.job_user = jobService.getJobUsers($routeParams.id, 'job,user,user.user-images');
                $scope.job_user.$promise.then(function (response) {
                    angular.forEach(response.data, function (obj, idx) {
                        if (obj.attributes.accepted || obj.attributes["will-perform"] || obj.attributes.performed) {
                            that.job_user_id = obj.id;
                            that.accepted = true;
                            that.accepted_at = obj.attributes["accepted-at"];

                            var found_user = $filter('filter')(response.included, {
                                id: "" + obj.relationships.user.data.id,
                                type: "users"
                            }, true);

                            that.user_apply = found_user[0];
                            that.user_apply.user_image = "assets/images/content/placeholder-profile-image.png";

                            if (that.user_apply.relationships["user-images"].data.length > 0) {
                                var found_user_image = $filter('filter')(response.included, {
                                    id: "" + that.user_apply.relationships["user-images"].data[0].id,
                                    type: "user-images"
                                }, true);
                                that.user_apply.user_image = found_user_image[0].attributes["image-url-small"];
                            }

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
        }])
    .controller('CompanyJobsCandidatesCtrl', ['jobService', 'justFlowService', 'userService', '$routeParams', '$scope', '$q', '$filter', 'Resources',
        function (jobService, flow, userService, $routeParams, $scope, $q, $filter, Resources) {
            var that = this;
            this.job_id = $routeParams.id;

            $scope.candidates = [];

            $scope.jobb_users = jobService.getJobUsers($routeParams.id, 'job,user,user.user-images');
            $scope.jobb_users.$promise.then(function (response) {
                $scope.job_users = [];
                angular.forEach(response.data, function (obj, key) {

                    obj.user_image = "assets/images/content/placeholder-profile-image.png";

                    var found = $filter('filter')(response.included, {
                        id: "" + obj.relationships.user.data.id,
                        type: "users"
                    }, true);

                    if (found.length > 0) {
                        obj.attributes["first-name"] = found[0].attributes["first-name"];
                        obj.attributes["last-name"] = found[0].attributes["last-name"];

                        if (found[0].relationships["user-images"].data.length > 0) {
                            var found_image = $filter('filter')(response.included, {
                                id: "" + found[0].relationships["user-images"].data[0].id,
                                type: "user-images"
                            }, true);

                            if (found_image.length > 0) {
                                obj.user_image = found_image[0].attributes["image-url-small"];
                            }
                        }
                    }

                    $scope.job_users.push(obj);
                });

                var found1 = $filter('filter')(response.included, {
                    id: "" + that.job_id,
                    type: "jobs"
                }, true);

                if (found1.length > 0) {
                    $scope.job = found1[0];
                    Resources.company.get({
                        company_id: found1[0].relationships.company.data.id,
                        'include': 'company-images'
                    }, function (response) {
                        $scope.job.company = response.data;
                        $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                        if (response.data.relationships["company-images"].data.length > 0) {
                            var found = $filter('filter')(response.included, {id: "" + response.data.relationships["company-images"].data[0].id}, true);
                            if (found.length > 0) {
                                $scope.job.company_image = found[0].attributes["image-url-small"];
                            }

                        }
                    });
                }
            });
        }])
    .controller('CompanyJobsCandidateCtrl', ['jobService', 'invoiceService', 'ratingService', 'justFlowService', 'justRoutes', 'userService', '$routeParams', '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources',
        function (jobService, invoiceService, ratingService, flow, routes, userService, $routeParams, $scope, $q, $filter, MyDate, $interval, Resources) {
            var that = this;
            this.job_id = $routeParams.job_id;
            this.job_user_id = $routeParams.job_user_id;
            this.candidate_model = {};
            $scope.currTab = 1;
            $scope.modalShow = false;

            this.maxWaitMinutes = 720; //12 hours
            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.user_apply = {};
            this.remainHours = 12;
            this.remainMinutes = 0;
            this.hasInvoice = false;

            this.ratingModel = ratingService.ratingModel;

            $scope.getNumber = function (num) {
                return new Array(parseInt(num));
            };

            this.getUserRating = function (user_id) {
                Resources.userRating.get({id: user_id, 'include': 'comments'});
            };

            this.getUserRating($routeParams.job_id);

            this.getUserPerformedJobs = function (user_id) {
                $scope.userPerformedJobs = jobService.getUserJobs({
                    user_id: user_id,
                    "include": "job",
                    "filter[performed]": true
                });

                $scope.userPerformedJobs.$promise.then(function (response) {
                    var deferd = $q.defer();

                    $scope.userPerformedJobs = [];
                    var found = $filter('filter')(response.included, {type: 'jobs'}, true);

                    if (found) {
                        Resources.userRating.get({id: user_id, 'include': 'comment'}, function (result) {
                            angular.forEach(found, function (obj, idx) {
                                var found_rating = $filter('filter')(result.data, {relationships: {job: {data: {id: "" + obj.id}}}}, true);
                                if (found_rating.length > 0) {
                                    found[idx].rating = found_rating[0];
                                }
                                $scope.userPerformedJobs.push(found[idx]);
                            });
                            deferd.resolve($scope.userPerformedJobs);
                            return deferd.promise;
                        });
                    }
                });
            };


            this.getJobData = function () {
                $scope.jobb = jobService.getJob(that.job_id, 'company,hourly-pay');
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


                that.model = jobService.getJobUser(that.job_id, that.job_user_id, 'job,user,user.user-images,hourly-pay');
                that.model.$promise.then(function (response) {

                    that.candidate_model = {};
                    var found = $filter('filter')(response.included, {
                        id: "" + response.data.relationships.user.data.id,
                        type: "users"
                    }, true);

                    that.user_apply = found[0];
                    that.user_apply.user_image = "assets/images/content/placeholder-profile-image.png";

                    if (that.user_apply.relationships["user-images"].data.length > 0) {
                        var found_user_image = $filter('filter')(response.included, {
                            id: "" + that.user_apply.relationships["user-images"].data[0].id,
                            type: "user-images"
                        }, true);
                        that.user_apply.user_image = found_user_image[0].attributes["image-url-small"];
                    }

                    if (found.length > 0) {
                        that.candidate_model = found[0].attributes;
                        that.ratingModel.data.attributes["user-id"] = parseInt(found[0].id);
                        that.getUserPerformedJobs(parseInt(found[0].id));
                    }

                    if (response.data.attributes.accepted || response.data.attributes["will-perform"] || response.data.attributes.performed) {
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

                    Resources.userRating.get({id:that.user_apply.id},function(result){
                        that.user_apply.rating = result.meta["average-score"];
                    });

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
                /*if (remainTime <= 0) {
                 that.accepted = false;
                 that.accepted_at = null;
                 that.user_apply = {};
                 }*/
                return remainTime;
            };

        }]);

