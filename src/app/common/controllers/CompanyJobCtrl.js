angular.module('just.common')
    .filter('reverse', function () {
        return function (items) {
            if (items) {
                return items.slice().reverse();
            } else {
                return items;
            }

        };
    })
    .controller('CompanyJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {}; //accepted:false
            $scope.jobs_invoice = []; //performed:true, invoice: notnull
            $scope.jobs_accepted = []; //will-perform:true: performed:false
            $scope.jobs_performed = []; //performed:true, invoice: null

            this.company_jobs_tab = 1;

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkCompanyUser(routes.global.start.url);
                } else {
                    return;
                }
            });

            $scope.jobs = jobService.getOwnedJobs(authService.userId().id, "job-users");

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
                                    var found_i = [];
                                    angular.forEach(response.included, function (obj3, key3) {
                                        if (obj3.type === "job-users" && obj3.id === "" + obj2.id &&
                                            obj3.relationships.invoice.data !== null) {
                                            found_i.push(obj3);
                                        }
                                    });
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
                                                if (found_s[0].relationships["user-images"].data !== null && found_s[0].relationships["user-images"].data.length > 0) {
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
                                            var jobIdx = $scope.jobs_invoice.length - 1;

                                            Resources.userRating.get({
                                                id: result.data.relationships.user.data.id,
                                                'filter[job-id]': obj.id
                                            }, function (ratingResp) {
                                                $scope.jobs_invoice[jobIdx].rating = ratingResp.meta["average-score"];
                                            });
                                        });
                                    }
                                }
                                if (keepGoing) {
                                    // ongoing
                                    var found = $filter('filter')(response.included, {
                                        id: "" + obj2.id,
                                        type: "job-users",
                                        attributes: {
                                            "will-perform": true,
                                            "performed": false
                                        }
                                    }, true);
                                    if (found.length > 0) {
                                        Resources.jobUser.get({
                                            job_id: obj.id,
                                            id: found[0].id,
                                            'include': 'user,user.user-images'
                                        }, function (result) {
                                            var found_s = $filter('filter')(result.included, {
                                                id: "" + result.data.relationships.user.data.id,
                                                type: "users"
                                            }, true);

                                            if (found_s.length > 0) {
                                                obj.attributes["first-name"] = found_s[0].attributes["first-name"];
                                                obj.attributes["last-name"] = found_s[0].attributes["last-name"];
                                            }
                                            $scope.jobs_accepted.push(obj);
                                        });
                                        keepGoing = false;
                                    }
                                }
                                if (keepGoing) {
                                    // ongoing
                                    var found_p = $filter('filter')(response.included, {
                                        id: "" + obj2.id,
                                        type: "job-users",
                                        attributes: {
                                            "performed": true
                                        }
                                    }, true);
                                    if (found_p.length > 0) {
                                        keepGoing = false;
                                        Resources.jobUser.get({
                                            job_id: obj.id,
                                            id: found_p[0].id,
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
                                                if (found_s[0].relationships["user-images"].data !== null && found_s[0].relationships["user-images"].data.length > 0) {
                                                    var found_img = $filter('filter')(result.included, {
                                                        id: "" + found_s[0].relationships["user-images"].data[0].id,
                                                        type: "user-images"
                                                    }, true);
                                                    if (found_img.length > 0) {
                                                        obj.attributes["image-url-small"] = found_img[0].attributes["image-url-small"];
                                                    }
                                                }
                                            }
                                            $scope.jobs_performed.push(obj);
                                        });
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
    .controller('CompanyJobsManageCtrl', ['jobService', 'authService', 'invoiceService', 'chatService', 'ratingService',
        'justFlowService', 'justRoutes', 'userService', 'companyService', '$routeParams',
        '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources',
        function (jobService, authService, invoiceService, chatService, ratingService,
                  flow, routes, userService, companyService, $routeParams,
                  $scope, $q, $filter, MyDate, $interval, Resources) {
            var that = this;
            this.job_user_id = null;
            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform_confirmation_by = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.user_apply = {};
            this.remainHours = 18;
            this.remainMinutes = 0;
            this.hasInvoice = false;
            this.showStatus = false;
            this.canPerformed = false;

            $scope.job_obj = {id: $routeParams.id};
            this.ratingModel = ratingService.ratingModel;

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkCompanyUser(routes.global.start.url);
                } else {
                    return;
                }
            });


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

            //this.userChats = chatService.getUserChat();


            this.calcRemainTime = function () {
                var acceptedDate = new MyDate(new Date());
                acceptedDate.setISO8601(that.accepted_at);
                var willPerformDate = new MyDate(new Date());
                willPerformDate.setISO8601(that.will_perform_confirmation_by);
                var nowDate = new Date();
                var diffMs = (willPerformDate.date - nowDate);
                var diffMins = Math.round(diffMs / 60000); // minutes
                var remainTime = diffMins;
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
                    that.canPerformed = that.checkJobDate(response.data.attributes["job-date"]);
                    $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                    $scope.comments_amt = response.data.relationships.comments.data.length;

                    var found_hourly_pay = $filter('filter')(response.included, {
                        id: "" + response.data.relationships["hourly-pay"].data.id,
                        type: "hourly-pays"
                    }, true);

                    if (found_hourly_pay.length > 0) {
                        $scope.job.hourly_pay = found_hourly_pay[0].attributes;
                        $scope.job.rate = found_hourly_pay[0].attributes["rate-excluding-vat"];
                        $scope.job.max_rate = $scope.job.rate * response.data.attributes.hours;
                    }

                    var company_image_arr = response.included[0].relationships["company-images"].data;
                    if (company_image_arr.length > 0) {
                        var getCompany = companyService.getCompanyById(response.data.relationships.company.data.id);
                        if (getCompany) {
                            var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                            if (found_image) {
                                if (found_image.length > 0) {
                                    $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                        } else {
                            Resources.company.get({
                                company_id: response.data.relationships.company.data.id,
                                'include': 'company-images'
                            }, function (result0) {
                                var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                if (found_image) {
                                    if (found_image.length > 0) {
                                        $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                    }
                                }
                                companyService.addList(result0);
                            });
                        }
                    }
                });

                $scope.job_user = jobService.getJobUsers($routeParams.id, 'job,user,user.user-images');
                $scope.job_user.$promise.then(function (response) {
                    var isFound = 0;
                    var currJobuserPoint = 0;
                    angular.forEach(response.data, function (obj, idx) {
                        var jobuserPoint = 0;

                        if (obj.attributes.accepted) {
                            jobuserPoint = 1;
                        }
                        if (obj.attributes["will-perform"]) {
                            jobuserPoint = 2;
                        }
                        if (obj.attributes.performed) {
                            jobuserPoint = 3;
                        }
                        if (currJobuserPoint < jobuserPoint) {
                            currJobuserPoint = jobuserPoint;

                            if (obj.attributes.accepted || obj.attributes["will-perform"] || obj.attributes.performed) {
                                that.job_user_id = obj.id;
                                that.accepted = true;
                                that.accepted_at = obj.attributes["accepted-at"];
                                that.will_perform_confirmation_by = obj.attributes["will-perform-confirmation-by"];

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
                            }

                            if (obj.relationships.invoice.data !== null) {
                                that.hasInvoice = true;
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


                    that.userChats = chatService.getUserChat();
                    that.userChats.$promise.then(function (result) {
                        var deferd = $q.defer();
                        that.userChats = {data: []};
                        angular.forEach(response.data, function (obj, idx) {
                            var found = $filter('filter')(result.data, {
                                relationships: {users: {data: {id: obj.relationships.user.data.id}}}
                            }, true);
                            if (found.length > 0) {
                                found[0]["job-users"] = obj;

                                var found_u = $filter('filter')(response.included, {
                                    id: obj.relationships.user.data.id,
                                    type: 'users'
                                }, true);

                                if (found_u.length > 0) {
                                    found[0].users = found_u[0];
                                }

                                that.userChats.data.push(found[0]);
                            }


                        });
                        deferd.resolve(that.userChats);
                        return deferd.promise;
                    });
                });


            };

            this.gotoChat = function (job_user_id, chat_id) {
                flow.next(routes.company.job_candidate.resolve($routeParams.id, job_user_id), chat_id);
            };

            this.ownerCancelPerformed = function () {
                jobService.userCancelPerformedJob($routeParams.id, that.job_user_id, that.fn);
            };

            // USER report job finish
            this.userPerformed = function () {
                if (that.performed) {
                    that.createInvoice();
                } else {
                    jobService.userPerformedJob($routeParams.id, that.job_user_id, that.createInvoice);
                }
            };

            this.createInvoice = function () {
                invoiceService.createInvoice($routeParams.id, that.job_user_id, that.submitJobRating);
            };

            this.submitJobRating = function () {
                ratingService.submitRating($routeParams.id, that.ratingModel, that.fn);
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

            this.fn = function (result) {
                if (result === 1) {
                    that.getJobData();
                }

                // clear owner create invoice
                $scope.isPerformed = false;
                $scope.modalPerformShow = false;
            };

            this.showConfirm = function () {
                $scope.modalPerformShow = true;
                $scope.isPerformed = false;
            };

            this.hideConfirm = function () {
                $scope.modalPerformShow = false;
                $scope.isPerformed = true;
            };

            this.showRatingform = function () {
                $scope.modalPerformShow = true;
                $scope.isPerformed = true;
            };
        }
    ])
    .controller('CompanyJobsCommentsCtrl', ['jobService', 'authService', 'i18nService', 'companyService',
        'commentService', 'justFlowService', 'justRoutes', '$routeParams',
        '$scope', '$q', '$filter', '$http', 'settings', 'Resources', 'userService', 'gtService',
        function (jobService, authService, i18nService, companyService,
                  commentService, flow, routes, $routeParams,
                  $scope, $q, $filter, $http, settings, Resources, userService, gtService) {
            var that = this;
            this.model = commentService.getModel('jobs', $routeParams.id);
            this.message = {};

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkCompanyUser(routes.global.start.url);
                } else {
                    return;
                }
            });

            i18nService.addLanguageChangeListener(function () {
                    that.getComments($routeParams.id);
                }
            );

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
                    $scope.job.rate = found_hourly_pay[0].attributes["rate-excluding-vat"];
                    $scope.job.max_rate = $scope.job.rate * response.data.attributes.hours;
                }

                var company_image_arr = response.included[0].relationships["company-images"].data;
                if (company_image_arr.length > 0) {
                    var getCompany = companyService.getCompanyById(response.data.relationships.company.data.id);
                    if (getCompany) {
                        var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                        if (found_image) {
                            if (found_image.length > 0) {
                                $scope.job.company_image = found_image[0].attributes["image-url-small"];
                            }
                        }
                    } else {
                        Resources.company.get({
                            company_id: response.data.relationships.company.data.id,
                            'include': 'company-images'
                        }, function (result0) {
                            var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                            if (found_image) {
                                if (found_image.length > 0) {
                                    $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                            companyService.addList(result0);
                        });
                    }
                }
            });

            this.getComments = function (job_id) {
                $scope.commentss = commentService.getComments('jobs', job_id, 'owner,owner.user-images');
                $scope.commentss.$promise.then(function (response) {
                    $scope.comments = response.data;
                    angular.forEach(response.data, function (obj, key) {
                        var found = $filter('filter')(response.included, {
                            id: "" + obj.relationships.owner.data.id,
                            type: "users"
                        }, true);
                        if (found.length > 0) {
                            if (found[0].relationships.company.data !== null) {
                                $scope.comments[key].attributes["first-name"] = found[0].attributes["first-name"];
                                $scope.comments[key].attributes["last-name"] = '';

                                $scope.comments[key].user_image = "assets/images/content/placeholder-logo.png";

                                var getCompany = companyService.getCompanyById(found[0].relationships.company.data.id);

                                if (getCompany) {
                                    $scope.comments[key].attributes["first-name"] = getCompany.data.attributes.name;
                                    var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                                    if (found_image) {
                                        if (found_image.length > 0) {
                                            $scope.comments[key].user_image = found_image[0].attributes["image-url-small"];
                                        }
                                    }
                                } else {
                                    Resources.company.get({
                                        company_id: found[0].relationships.company.data.id,
                                        'include': 'company-images'
                                    }, function (result0) {
                                        $scope.comments[key].attributes["first-name"] = result0.data.attributes.name;
                                        var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                        if (found_image) {
                                            if (found_image.length > 0) {
                                                $scope.comments[key].user_image = found_image[0].attributes["image-url-small"];
                                            }
                                        }
                                        companyService.addList(result0);
                                    });
                                }
                            } else {
                                $scope.comments[key].attributes["first-name"] = found[0].attributes["first-name"];
                                $scope.comments[key].attributes["last-name"] = found[0].attributes["last-name"];

                                $scope.comments[key].user_image = "assets/images/content/placeholder-profile-image.png";

                                if (found[0].relationships["user-images"].data.length > 0) {
                                    var found_image0 = $filter('filter')(response.included, {
                                        id: "" + found[0].relationships["user-images"].data[0].id,
                                        type: "user-images"
                                    }, true);
                                    if (found_image0.length > 0) {
                                        $scope.comments[key].user_image = found_image0[0].attributes["image-url-small"];
                                    }
                                }
                            }
                        }
                        if (authService.userId().id === obj.relationships.owner.data.id) {
                            $scope.comments[key].attributes.isOwner = 1;
                        } else {
                            $scope.comments[key].attributes.isOwner = 0;
                        }

                        if ($scope.comments[key].attributes.body) {
                            gtService.translate($scope.comments[key].attributes.body)
                                .then(function (translation) {
                                    $scope.comments[key].translation = {};
                                    $scope.comments[key].translation.text = translation.translatedText;
                                    $scope.comments[key].translation.from = translation.detectedSourceLanguage;
                                    $scope.comments[key].translation.from_name = translation.detectedSourceLanguageName;
                                    $scope.comments[key].translation.from_direction = translation.detectedSourceLanguageDirection;
                                    $scope.comments[key].translation.to = translation.targetLanguage;
                                    $scope.comments[key].translation.to_name = translation.targetLanguageName;
                                    $scope.comments[key].translation.to_direction = translation.targetLanguageDirection;
                                });
                        }
                    });
                });
            };

            this.getComments($routeParams.id);

            this.submit = function () {
                that.model.data.attributes["language-id"] = parseInt(i18nService.getLanguage().$$state.value.id);
                var formData = {};
                angular.copy(that.model, formData);
                that.model.data.attributes.body = "";
                Resources.comments.create({
                    resource_name: "jobs",
                    resource_id: $routeParams.id
                }, formData, function (response) {
                    $scope.formComment.txt_chatbox.$setUntouched();
                    that.autoExpand('txt_chatbox');
                    that.getComments($routeParams.id);
                });
            };

            this.checkEnter = function (objId, e) {
                if (e.keyCode === 13 && !e.shiftKey) {
                    e.preventDefault();
                    if (that.model.data.attributes.body) {
                        if (that.model.data.attributes.body !== '') {
                            that.submit();
                        }
                    }
                }
            };

            this.autoExpand = function (objId) {
                var text = $("#" + objId).val();
                var lines = text.split(/\r|\r\n|\n/);
                var count = lines.length;
                var objH = (count + 1) * 20;

                if (objH <= 40) {
                    objH = 40;
                }

                $("#" + objId).height(objH - 20);

                if(count === 1){
                    var scrollH = document.getElementById(objId).scrollHeight;
                    if(scrollH > objH){
                        $("#" + objId).height(scrollH - 20);
                    }
                }
            };
        }])
    .controller('CompanyJobsCandidatesCtrl', ['jobService', 'justFlowService', 'justRoutes', 'authService', 'userService',
        'companyService', '$routeParams', '$scope', '$q', '$filter', 'Resources',
        function (jobService, flow, routes, authService, userService,
                  companyService, $routeParams, $scope, $q, $filter, Resources) {
            var that = this;
            this.job_id = $routeParams.id;

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkCompanyUser(routes.global.start.url);
                } else {
                    return;
                }
            });

            $scope.candidates = [];

            $scope.jobb_users = jobService.getJobUsers($routeParams.id, 'job,user,user.user-images');
            $scope.jobb_users.$promise.then(function (response) {
                $scope.job_users = response.data;
                angular.forEach(response.data, function (obj, key) {

                    $scope.job_users[key].user_image = "assets/images/content/placeholder-profile-image.png";

                    var found = $filter('filter')(response.included, {
                        id: "" + obj.relationships.user.data.id,
                        type: "users"
                    }, true);

                    if (found.length > 0) {
                        $scope.job_users[key].attributes["first-name"] = found[0].attributes["first-name"];
                        $scope.job_users[key].attributes["last-name"] = found[0].attributes["last-name"];

                        if (found[0].relationships["user-images"].data.length > 0) {
                            var found_image = $filter('filter')(response.included, {
                                id: "" + found[0].relationships["user-images"].data[0].id,
                                type: "user-images"
                            }, true);

                            if (found_image.length > 0) {
                                $scope.job_users[key].user_image = found_image[0].attributes["image-url-small"];
                            }
                        }

                        Resources.userRating.get({
                            id: obj.relationships.user.data.id
                        }, function (result) {
                            $scope.job_users[key].rating = result.meta["average-score"];
                        });

                        $scope.userJobs = jobService.getUserJobs({
                            user_id: obj.relationships.user.data.id,
                            "filter[will-perform]": true
                        });

                        $scope.userJobs.$promise.then(function (response) {
                            $scope.job_users[key].total_uppdrag = response.meta.total;
                        });
                    }
                });

                var found1 = $filter('filter')(response.included, {
                    id: "" + that.job_id,
                    type: "jobs"
                }, true);

                if (found1.length > 0) {
                    $scope.job = found1[0];
                    $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                    var getCompany = companyService.getCompanyById(found1[0].relationships.company.data.id);

                    if (getCompany) {
                        $scope.job.company = getCompany.data;
                        var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                        if(found_image){
                            if (found_image.length > 0) {
                                $scope.job.company_image = found_image[0].attributes["image-url-small"];
                            }
                        }
                    }else{
                        Resources.company.get({
                            company_id: found1[0].relationships.company.data.id,
                            'include': 'company-images'
                        }, function (response) {
                            $scope.job.company = response.data;

                            if (response.data.relationships["company-images"].data.length > 0) {
                                var found = $filter('filter')(response.included, {id: "" + response.data.relationships["company-images"].data[0].id}, true);
                                if (found.length > 0) {
                                    $scope.job.company_image = found[0].attributes["image-url-small"];
                                }
                            }
                            companyService.addList(response);
                        });
                    }
                }
            });

            that.gotoJobCandidatePage = function(job_id, job_user_id){
                flow.next(routes.company.job_candidate.resolve(job_id,job_user_id), {currTab:2});
            };
        }])
    .controller('CompanyJobsCandidateCtrl', ['jobService', 'invoiceService', 'authService', 'i18nService', 'chatService',
        'ratingService', 'justFlowService', 'justRoutes', 'userService', 'companyService', '$routeParams', '$scope', '$q', '$filter',
        'MyDate', '$interval', 'Resources', '$http', 'settings', 'gtService',
        function (jobService, invoiceService, authService, i18nService, chatService,
                  ratingService, flow, routes, userService, companyService, $routeParams, $scope, $q, $filter,
                  MyDate, $interval, Resources, $http, settings, gtService) {
            var that = this;
            this.job_id = $routeParams.job_id;
            this.job_user_id = $routeParams.job_user_id;
            this.candidate_model = {};
            $scope.currTab = 1;
            $scope.modalShow = false;

            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform_confirmation_by = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.user_apply = {};
            this.remainHours = 18;
            this.remainMinutes = 0;
            this.hasInvoice = false;

            chatService.clearChat();
            this.chatId = undefined;
            this.canPerformed = false;

            this.ratingModel = ratingService.ratingModel;

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkCompanyUser(routes.global.start.url);
                } else {
                    return;
                }
            });

            $scope.getNumber = function (num) {
                return new Array(parseInt(num));
            };

            i18nService.addLanguageChangeListener(function () {
                    that.translateCandidate(that.candidate_model);
            });
            //handle different dynamic translations
            $scope.dt = {
                candidate_item: true
            };
            this.toggleDT = function (textId) {
                $scope.dt[textId] = !$scope.dt[textId];
            };

            if (flow.next_data) {
                if(typeof(flow.next_data) !== 'object'){
                    that.chatId = flow.next_data;
                    $scope.currTab = 3;
                    flow.next_data = undefined;
                }else{
                    if(flow.next_data.currTab){
                        $scope.currTab = flow.next_data.currTab;
                        flow.next_data = undefined;
                    }
                }
            }

            this.getUserPerformedJobs = function (user_id) {
                $scope.userPerformedJobss = jobService.getUserJobs({
                    user_id: user_id,
                    "include": "job",
                    "page[size]": 50
                });

                $scope.userPerformedJobss.$promise.then(function (response) {
                    $scope.userPerformedJobs = [];
                    angular.forEach(response.data, function (obj, idx) {
                        if (obj.relationships.invoice.data !== null) {
                            var found_job = $filter('filter')(response.included, {
                                id: "" + obj.relationships.job.data.id,
                                type: 'jobs'
                            }, true);
                            if (found_job.length > 0) {
                                $scope.userPerformedJobs.push(found_job[0]);
                            }
                        }
                    });

                    //$scope.userPerformedJobs = $filter('filter')(response.included, {type: 'jobs'}, true);

                    if ($scope.userPerformedJobs) {
                        Resources.userRating.get({id: user_id, 'include': 'comment'}, function (result) {
                            angular.forEach($scope.userPerformedJobs, function (obj, idx) {
                                var found_rating = $filter('filter')(result.data, {relationships: {job: {data: {id: "" + obj.id}}}}, true);
                                if (found_rating.length > 0) {
                                    $scope.userPerformedJobs[idx].rating = found_rating[0];
                                }
                            });
                        });
                    }

                    angular.forEach($scope.userPerformedJobs, function (obj, idx) {
                        $scope.userPerformedJobs[idx].company_image = "assets/images/content/placeholder-logo.png";
                    });

                    angular.forEach($scope.userPerformedJobs, function (obj, idx) {
                        var getCompany = companyService.getCompanyById(obj.relationships.company.data.id);
                        if (getCompany) {
                            var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                            if(found_image){
                                if (found_image.length > 0) {
                                    $scope.userPerformedJobs[idx].company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                        } else {
                            Resources.company.get({
                                company_id: obj.relationships.company.data.id,
                                'include': 'company-images'
                            }, function (result0) {
                                var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                if(found_image){
                                    if (found_image.length > 0) {
                                        $scope.userPerformedJobs[idx].company_image = found_image[0].attributes["image-url-small"];
                                    }
                                }
                                companyService.addList(result0);
                            });
                        }
                    });
                });
            };

            this.getJobData = function () {
                $scope.jobb = jobService.getJob(that.job_id, 'company,hourly-pay');
                $scope.jobb.$promise.then(function (response) {
                    $scope.job = response.data;
                    $scope.job.company = response.included[0];
                    that.canPerformed = that.checkJobDate(response.data.attributes["job-date"]);
                    $scope.job.company_image = "assets/images/content/placeholder-logo.png";

                    var found_hourly_pay = $filter('filter')(response.included, {
                        id: "" + response.data.relationships["hourly-pay"].data.id,
                        type: "hourly-pays"
                    }, true);

                    if (found_hourly_pay.length > 0) {
                        $scope.job.hourly_pay = found_hourly_pay[0].attributes;
                        $scope.job.rate = found_hourly_pay[0].attributes["rate-excluding-vat"];
                        $scope.job.max_rate = $scope.job.rate * response.data.attributes.hours;
                    }

                    var company_image_arr = response.included[0].relationships["company-images"].data;
                    if (company_image_arr.length > 0) {
                        var getCompany = companyService.getCompanyById(response.data.relationships.company.data.id);
                        if (getCompany) {
                            var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                            if (found_image) {
                                if (found_image.length > 0) {
                                    $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                        } else {
                            Resources.company.get({
                                company_id: response.data.relationships.company.data.id,
                                'include': 'company-images'
                            }, function (result0) {
                                var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                if (found_image) {
                                    if (found_image.length > 0) {
                                        $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                    }
                                }
                                companyService.addList(result0);
                            });
                        }
                    }
                });

                $scope.job_user = jobService.getJobUsers(that.job_id, 'job,user,user.user-images');
                $scope.job_user.$promise.then(function (response) {

                    var isFound = 0;
                    angular.forEach(response.data, function (obj, idx) {
                        if (isFound === 0) {
                            if (obj.relationships.invoice.data !== null) {
                                that.hasInvoice = true;
                            }
                            isFound = 1;
                        }
                    });
                });


                that.model = jobService.getJobUser(that.job_id, that.job_user_id, 'job,user,user.user-images,hourly-pay,user.language,user.languages');
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

                        that.candidate_model.languages = [];
                        if (that.user_apply.relationships.languages) {
                            angular.forEach(that.user_apply.relationships.languages.data, function (obj_lang, idx_lang) {
                                var found_lang = $filter('filter')(response.included, {
                                    type: "languages",
                                    id: "" + obj_lang.id
                                }, true);

                                if(found_lang){
                                    if(found_lang.length>0){
                                        that.candidate_model.languages.push(found_lang[0]);
                                    }
                                }
                            });
                        }


                        /*var found_user_languages = $filter('filter')(response.included, {
                            type: "languages"
                        }, true);

                        if (found_user_languages.length > 0) {
                            that.candidate_model.languages = found_user_languages;
                        }*/

                        that.ratingModel.data.attributes["user-id"] = parseInt(found[0].id);
                        that.getUserPerformedJobs(parseInt(found[0].id));

                        that.translateCandidate(that.candidate_model);
                    }

                    if (response.data.attributes.accepted || response.data.attributes["will-perform"] || response.data.attributes.performed) {
                        that.accepted = true;
                        that.accepted_at = response.data.attributes["accepted-at"];
                        that.will_perform_confirmation_by = response.data.attributes["will-perform-confirmation-by"];
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

                    /*if (response.data.relationships.invoice.data !== null) {
                     that.hasInvoice = true;
                     } else {
                     that.hasInvoice = false;
                     }*/

                    Resources.userRating.get({id: that.user_apply.id}, function (result) {
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

            this.translateCandidate = function (model) {
                if (model.description) {
                    gtService.translate(model.description)
                        .then(function (translation) {
                            if (!model.translation) {
                                model.translation = {};
                            }
                            model.translation.description = {};
                            model.translation.description.text = translation.translatedText;
                            model.translation.description.from = translation.detectedSourceLanguage;
                            model.translation.description.from_name = translation.detectedSourceLanguageName;
                            model.translation.description.from_direction = translation.detectedSourceLanguageDirection;
                            model.translation.description.to = translation.targetLanguage;
                            model.translation.description.to_name = translation.targetLanguageName;
                            model.translation.description.to_direction = translation.targetLanguageDirection;
                        });
                }
                if (model["job-experience"]) {
                    gtService.translate(model["job-experience"])
                        .then(function (translation) {
                            if (!model.translation) {
                                model.translation = {};
                            }
                            model.translation.job_experience = {};
                            model.translation.job_experience.text = translation.translatedText;
                            model.translation.job_experience.from = translation.detectedSourceLanguage;
                            model.translation.job_experience.from_name = translation.detectedSourceLanguageName;
                            model.translation.job_experience.from_direction = translation.detectedSourceLanguageDirection;
                            model.translation.job_experience.to = translation.targetLanguage;
                            model.translation.job_experience.to_name = translation.targetLanguageName;
                            model.translation.job_experience.to_direction = translation.targetLanguageDirection;
                        });
                }
                if (model.education) {
                    gtService.translate(model.education)
                        .then(function (translation) {
                            if (!model.translation) {
                                model.translation = {};
                            }
                            model.translation.education = {};
                            model.translation.education.text = translation.translatedText;
                            model.translation.education.from = translation.detectedSourceLanguage;
                            model.translation.education.from_name = translation.detectedSourceLanguageName;
                            model.translation.education.from_direction = translation.detectedSourceLanguageDirection;
                            model.translation.education.to = translation.targetLanguage;
                            model.translation.education.to_name = translation.targetLanguageName;
                            model.translation.education.to_direction = translation.targetLanguageDirection;
                        });
                }
                if (model["competence-text"]) {
                    gtService.translate(model["competence-text"])
                        .then(function (translation) {
                            if (!model.translation) {
                                model.translation = {};
                            }
                            model.translation.competence_text = {};
                            model.translation.competence_text.text = translation.translatedText;
                            model.translation.competence_text.from = translation.detectedSourceLanguage;
                            model.translation.competence_text.from_name = translation.detectedSourceLanguageName;
                            model.translation.competence_text.from_direction = translation.detectedSourceLanguageDirection;
                            model.translation.competence_text.to = translation.targetLanguage;
                            model.translation.competence_text.to_name = translation.targetLanguageName;
                            model.translation.competence_text.to_direction = translation.targetLanguageDirection;
                        });
                }
            };

            this.acceptJob = function () {
                jobService.ownerAcceptJob(that.job_id, that.job_user_id, that.fn);
            };

            this.ownerCancelPerformed = function () {
                jobService.userCancelPerformedJob(that.job_id, that.job_user_id, that.fn);
            };

            // USER report job finish
            this.userPerformed = function () {
                if (that.performed) {
                    that.this.createInvoice();
                } else {
                    jobService.userPerformedJob(that.job_id, that.job_user_id, that.createInvoice);
                }
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
                var willPeformDate = new MyDate(new Date());
                willPeformDate.setISO8601(that.will_perform_confirmation_by);
                var nowDate = new Date();
                var diffMs = (willPeformDate.date - nowDate);
                var diffMins = Math.round(diffMs / 60000); // minutes
                var remainTime = diffMins;
                that.remainHours = Math.floor((remainTime) / 60);
                that.remainMinutes = remainTime - (that.remainHours * 60);
                /*if (remainTime <= 0) {
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

            this.showConfirm = function () {
                $scope.modalPerformShow = true;
                $scope.isPerformed = false;
            };

            this.hideConfirm = function () {
                $scope.modalPerformShow = false;
                $scope.isPerformed = true;
            };

            this.showRatingform = function () {
                $scope.modalPerformShow = true;
                $scope.isPerformed = true;
            };
        }])
    .controller('CompanyJobsCandidateChatCtrl', ['authService', 'i18nService', 'chatService', 'justFlowService', 'justRoutes',
        'userService', '$routeParams', '$scope', '$q', '$filter', 'Resources', '$http', 'settings', 'gtService',
        function (authService, i18nService, chatService, flow, routes, userService, $routeParams, $scope, $q, $filter, Resources, $http, settings, gtService) {
            var that = this;

            this.disableChat = true;

            this.chatId = $scope.ctrl.chatId;
            this.chatModel = chatService.chatModel;
            this.chatMessageModel = chatService.chatMessageModel;
            this.chatModel.data.attributes["user-ids"] = [];

            $scope.$watch('ctrl.user_apply', function (data) {
                if (data.id) {
                    that.setChatValue(data);
                }
            });

            i18nService.addLanguageChangeListenerContinue(function () {
                    that.getChatMessage();
                }
            );

            this.setChatValue = function (user_apply) {
                if (!that.chatId) {
                    that.userChats = chatService.getUserChat();
                    that.userChats.$promise.then(function (response) {
                        var keepGoing = true;
                        angular.forEach(response.data, function (obj, key) {
                            if (keepGoing) {
                                that.user_id = authService.userId().id;
                                var found = $filter('filter')(obj.relationships.users.data, {id: user_apply.id}, true);
                                if (found.length > 0) {
                                    that.chatId = obj.id;
                                    chatService.setChatId(that.chatId);
                                    that.getChatMessage();
                                    keepGoing = false;
                                }
                            }
                        });
                        that.disableChat = false;
                    });
                } else {
                    chatService.setChatId(that.chatId);
                    that.getChatMessage();
                    that.disableChat = false;
                }
            };


            this.submitChat = function () {
                that.chatModel.data.attributes["user-ids"] = [authService.userId().id, $scope.ctrl.user_apply.id];
                that.chatMessageModel.data.attributes["language-id"] = parseInt(i18nService.getLanguage().$$state.value.id);
                chatService.newChatMessage(that.setChatId_get);
            };

            this.setChatId_get = function (chat_id) {
                $scope.formChat.txt_chatbox.$setUntouched();
                that.autoExpand('txt_chatbox');
                that.chatId = chat_id;
                that.getChatMessage();
            };

            this.getChatMessage = function () {
                var target_lang = i18nService.getLanguage().$$state.value['lang-code'];
                that.user_id = authService.userId().id;

                that.chatMessages = chatService.getChatMessage();

                that.chatMessages.$promise.then(function (response) {
                    angular.forEach(response.data, function (obj, key) {
                        var found_author = $filter('filter')(response.included, {
                            type: 'users',
                            id: obj.relationships.author.data.id
                        }, true);
                        if (found_author.length > 0) {
                            if (found_author[0].relationships.company.data) {
                                // is company
                                that.chatMessages.data[key].author = {attributes: {}};
                                that.chatMessages.data[key].author.attributes["first-name"] = $scope.job.company.attributes.name;
                                that.chatMessages.data[key].author.user_image = $scope.job.company_image;
                            } else {
                                that.chatMessages.data[key].author = found_author[0];

                                if (found_author[0].relationships["user-images"].data.length > 0) {
                                    var found_image = $filter('filter')(chatService.chatDetail.included, {relationships: {user: {data: {id: '' + found_author[0].id}}}}, true);
                                    that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                                    if (found_image) {
                                        if (found_image.length > 0) {
                                            that.chatMessages.data[key].author.user_image = found_image[0].attributes["image-url-small"];
                                        }
                                    }
                                } else {
                                    that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                                }
                            }
                        }
                        if (that.chatMessages.data[key].attributes.body) {
                            gtService.translate(that.chatMessages.data[key].attributes.body)
                                .then(function (translation) {
                                    that.chatMessages.data[key].translation = {};
                                    that.chatMessages.data[key].translation.text = translation.translatedText;
                                    that.chatMessages.data[key].translation.from = translation.detectedSourceLanguage;
                                    that.chatMessages.data[key].translation.from_name = translation.detectedSourceLanguageName;
                                    that.chatMessages.data[key].translation.from_direction = translation.detectedSourceLanguageDirection;
                                    that.chatMessages.data[key].translation.to = translation.targetLanguage;
                                    that.chatMessages.data[key].translation.to_name = translation.targetLanguageName;
                                    that.chatMessages.data[key].translation.to_direction = translation.targetLanguageDirection;
                                });
                        }
                    });
                });
            };

            this.checkEnter = function (objId, e) {
                if (e.keyCode === 13 && !e.shiftKey) {
                    e.preventDefault();
                    if (that.chatMessageModel.data.attributes.body) {
                        if (that.chatMessageModel.data.attributes.body !== '') {
                            that.submitChat();
                        }
                    }
                }
            };

            this.autoExpand = function (objId) {
                var text = $("#" + objId).val();
                var lines = text.split(/\r|\r\n|\n/);
                var count = lines.length;
                var objH = (count + 1) * 20;

                if (objH <= 40) {
                    objH = 40;
                }

                $("#" + objId).height(objH - 20);

                if(count === 1){
                    var scrollH = document.getElementById(objId).scrollHeight;
                    if(scrollH > objH){
                        $("#" + objId).height(scrollH - 20);
                    }
                }
            };
        }]);
