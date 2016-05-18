angular.module('just.common')


    .controller('ArriverJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};

            this.arriver_jobs_tab = 1;

            that.isCompany = 0;

            userService.checkArriverUser("Available for Arriver user", "Back to Home", routes.global.start.url);

            $scope.jobbs = jobService.getUserJobs({
                user_id: authService.userId().id,
                "include": "job",
                "page[size]": 50
            });
            $scope.jobbs.$promise.then(function (response) {
                $scope.jobs = [];
                $scope.userPerformedJobs = [];

                angular.forEach(response.included, function (obj, key) {


                    var found = $filter('filter')(response.data, {relationships: {job: {data: {id: "" + obj.id}}}}, true);
                    if (found.length > 0) {

                        if (found[0].relationships.invoice.data === null) {
                            obj["job-users"] = found[0];
                            if (!found[0].attributes.accepted && !found[0].attributes["will-perform"]) {
                                obj.attributes.text_status = "Du har sökt uppdraget";
                            }
                            if (found[0].attributes.accepted && !found[0].attributes["will-perform"]) {
                                Resources.job.get({id: "" + obj.id, 'include': 'company'}, function (result) {
                                    obj.attributes.text_status = result.included[0].attributes.name + " vill anlita dig";
                                });
                            }
                            if (found[0].attributes["will-perform"]) {
                                obj.attributes.text_status = "Du är anlitad";
                            }

                            $scope.jobs.push(obj);
                        } else {
                            $scope.userPerformedJobs.push(obj);
                        }
                    }

                });

                if ($scope.userPerformedJobs) {
                    Resources.userRating.get({id: authService.userId().id, 'include': 'comment'}, function (result) {
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
                    Resources.company.get({
                        company_id: "" + obj.relationships.company.data.id,
                        "include": "company-images"
                    }, function (result) {
                        if (result.included) {
                            $scope.userPerformedJobs[idx].company_image = result.included[0].attributes["image-url-small"];
                        }
                    });
                });
            });

            /*this.getUserPerformedJobs = function (user_id) {
             $scope.userPerformedJobss = jobService.getUserJobs({
             user_id: user_id,
             "include": "job",
             "filter[will-perform]": true
             });

             $scope.userPerformedJobss.$promise.then(function (response) {

             var found_job = $filter('filter')(response.included, {type: 'jobs'}, true);
             if(found_job.length>0){
             angular.forEacj
             }


             $scope.userPerformedJobs = $filter('filter')(response.included, {type: 'jobs'}, true);

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
             Resources.company.get({
             company_id: "" + obj.relationships.company.data.id,
             "include": "company-images"
             }, function (result) {
             if (result.included) {
             $scope.userPerformedJobs[idx].company_image = result.included[0].attributes["image-url-small"];
             }
             });


             });

             });
             };*/

            this.gotoUserJobPage = function (obj) {
                flow.redirect(routes.arriver.job_manage.resolve(obj));
            };

            //this.getUserPerformedJobs(parseInt(authService.userId().id));
        }])

    .controller('ArriverJobsManageCtrl', ['jobService', 'authService', 'chatService', 'i18nService', 'financeService', 'justFlowService', 'justRoutes', 'userService', '$routeParams',
        '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources', '$http', 'gtService',
        function (jobService, authService, chatService, i18nService, financeService, flow, routes, userService, $routeParams, $scope, $q, $filter, MyDate, $interval, Resources, $http, gtService) {
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
            this.isCompany = 0;
            this.canPerformed = false;
            this.showStatus = false;
            this.financeModel = financeService.financeModel;
            this.financeMessage = financeService.financeMessage;
            this.chatModel = chatService.chatModel;
            this.chatMessageModel = chatService.chatMessageModel;
            this.chatId = chatService.chatId;
            this.chatMessages = chatService.chatMessages;
            this.chatModel.data.attributes["user-ids"] = [];

            this.chatId = chatService.chatId;

            i18nService.addLanguageChangeListener(function () {
                    that.getChatMessage();
                }
            );

            $scope.currTab = 1;

            $scope.job_obj = {id: $routeParams.id};

            userService.needSignin();

            this.model = userService.userModel();
            if (this.model) {
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
            }


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

                    $scope.comments_amt = response.data.relationships.comments.data.length;

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
                        that.will_perform_confirmation_by = response.data[0].attributes["will-perform-confirmation-by"];
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

                    that.userChats = chatService.getUserChat();
                    that.userChats.$promise.then(function (result) {
                        var deferd = $q.defer();
                        that.userChats = {data: []};

                        var found = $filter('filter')(result.data, {
                            relationships: {users: {data: {id: $scope.job.relationships.owner.data.id}}}
                        }, true);

                        if (found.length > 0) {
                            that.userChats.data.push(found[0]);

                            if (!that.chatId) {
                                that.chatId = found[0].id;
                                chatService.setChatId(that.chatId);
                                that.getChatMessage();
                            }
                        }

                        deferd.resolve(that.userChats);
                        return deferd.promise;
                    });

                    return deferd.promise;
                });
            };

            this.gotoChat = function (chat_id) {
                that.chatId = chat_id;
                $scope.userModalPerformShow = 3;
                chatService.setChatId(that.chatId);
                that.getChatMessage();
            };

            this.submitChat = function () {
                that.chatModel.data.attributes["user-ids"] = [authService.userId().id, $scope.job.relationships.owner.data.id];
                that.chatMessageModel.data.attributes["language-id"] = parseInt(i18nService.getLanguage().$$state.value.id);
                chatService.newChatMessage(that.setChatId_get);
            };

            this.setChatId_get = function (chat_id) {
                that.chatId = chat_id;
                that.getChatMessage();
            };

            this.getChatMessage = function () {
                var target_lang = i18nService.getLanguage().$$state.value['lang-code'];
                that.user_id = authService.userId().id;
                that.chatMessages = chatService.getChatMessage();
                that.chatMessages.$promise.then(function (response) {
                    //console.log(that.chatMessages);
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
                                that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                            }
                        }
                        if (that.chatMessages.data[key].attributes.body) {
                            gtService.translate(that.chatMessages.data[key].attributes.body)
                                .then(function (translation) {
                                    that.chatMessages.data[key].attributes.body_translated = translation.translatedText;
                                    that.chatMessages.data[key].attributes.body_translated_from = translation.detectedSourceLanguage;
                                    that.chatMessages.data[key].attributes.body_translated_from_name = translation.detectedSourceLanguageName;
                                    that.chatMessages.data[key].attributes.body_translated_to = translation.targetLanguage;
                                    that.chatMessages.data[key].attributes.body_translated_to_name = translation.targetLanguageName;
                                    that.chatMessages.data[key].attributes.body_translated_direction = translation.targetLanguageDirection;
                                });
                        }
                    });
                });
            };

            // Create Bank Account for USER
            this.createBankAccount = function () {
                financeService.createBankAccount(that.userWillPerform);
            };

            // USER Accept to do a job
            this.userWillPerform = function () {
                jobService.userWillPerformJob($routeParams.id, that.job_user_id, that.fn);
            };

            // USER report job finish
            this.userPerformed = function () {
                jobService.userPerformedJob($routeParams.id, that.job_user_id, that.fn);
            };

            this.translationWord = function () {
                var source_lang = 'sv';
                var target_lang = 'en';
                if (that.chatMessageModel.data.attributes.body) {
                    var url = "https://www.googleapis.com/language/translate/v2?key=AIzaSyAayH87DCtigubH3RpB05Z19NaAe4VzEac&q=" + encodeURIComponent(that.chatMessageModel.data.attributes.body) + "&source=" + source_lang + "&target=" + target_lang;
                    $http({method: 'GET', url: url}).then(function (response) {
                        that.chatMessageModel.data.attributes.body = response.data.translations.translatedText;
                    });
                }
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
                $scope.commentss = commentService.getComments('jobs', job_id, 'owner,owner.user-images');
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
                            var found_image = $filter('filter')(response.included, {
                                id: "" + found[0].relationships["user-images"].data[0].id,
                                type: "user-images"
                            }, true);
                            if (found_image.length > 0) {
                                $scope.comments[key].user_image = found_image[0].attributes["image-url-small"];
                            }
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
                    that.getComments($routeParams.id);
                });
            };
        }]);


