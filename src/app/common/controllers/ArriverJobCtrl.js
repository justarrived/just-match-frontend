angular.module('just.common')


    .controller('ArriverJobsCtrl', ['authService', 'justFlowService', 'justRoutes', 'userService', 'companyService', 'jobService', '$scope', '$q', '$filter', 'Resources',
        function (authService, flow, routes, userService, companyService, jobService, $scope, $q, $filter, Resources) {
            var that = this;

            $scope.jobs = {};

            this.arriver_jobs_tab = 1;

            that.isCompany = 0;

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkArriverUser(routes.global.start.url);
                } else {
                    return;
                }
            });

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
                                obj.attributes.text_status = "user.apply.confirmation";
                            }
                            if (found[0].attributes.accepted && !found[0].attributes["will-perform"]) {
                                obj.attributes.text_status = "assignment.status.user_company_hire";
                                /*Resources.job.get({id: "" + obj.id, 'include': 'company'}, function (result) {
                                 $scope.company_name_hiring = result.included[0].attributes.name;
                                 });*/
                            }
                            if (found[0].attributes["will-perform"]) {
                                obj.attributes.text_status = "assignment.status.you_hired";
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
                    var getCompany = companyService.getCompanyById(obj.relationships.company.data.id);
                    if (getCompany) {
                        var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                        if (found_image) {
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
                            if (found_image) {
                                if (found_image.length > 0) {
                                    $scope.userPerformedJobs[idx].company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                            companyService.addList(result0);
                        });
                    }
                });
            });

            this.gotoUserJobPage = function (obj) {
                flow.redirect(routes.arriver.job_manage.resolve(obj));
            };

        }])

    .controller('ArriverJobsManageCtrl', ['jobService', 'authService', 'chatService', 'i18nService', 'financeService', 'justFlowService', 'justRoutes', 'userService', 'companyService', '$routeParams',
        '$scope', '$q', '$filter', 'MyDate', '$interval', 'Resources', '$http', 'gtService',
        function (jobService, authService, chatService, i18nService, financeService, flow, routes, userService, companyService, $routeParams, $scope, $q, $filter, MyDate, $interval, Resources, $http, gtService) {
            var that = this;
            this.job_user_id = null;
            this.accepted = false; //owner choosed
            this.accepted_at = null; // datetime owner choosed
            this.will_perform_confirmation_by = null; // datetime owner choosed
            this.will_perform = false; //wait user confirm start work
            this.performed = false; // work end
            this.user_apply = {};
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

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkArriverUser(routes.global.start.url);
                } else {
                    return;
                }
            });

            i18nService.addLanguageChangeListener(function () {
                    that.getChatMessage();
                }
            );

            Resources.arriverTermsAgreements.get(function (result) {
                that.termsId = result.data.id;
                that.termsAgreements = result.data.attributes.url;
            });

            $scope.currTab = 1;

            $scope.job_obj = {id: $routeParams.id};

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
                        var getCompany = companyService.getCompanyById(response.included[0].id);
                        if (getCompany) {
                            var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                            if (found_image) {
                                if (found_image.length > 0) {
                                    $scope.job.company_image = found_image[0].attributes["image-url-small"];
                                }
                            }
                        } else {
                            Resources.company.get({
                                company_id: response.included[0].id,
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
                $scope.formChat.txt_chatbox.$setUntouched();
                that.autoExpand('txt_chatbox');
                that.chatId = chat_id;
                that.getChatMessage();
            };

            this.getChatMessage = function () {
                var target_lang = i18nService.getLanguage().$$state.value['lang-code'];
                that.user_id = authService.userId().id;
                that.chatMessages = chatService.getChatMessage();
                if (that.chatMessages.$promise) {
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
                }
            };

            // Create Bank Account for USER
            this.createBankAccount = function () {
                if ($scope.terms) {
                    that.termsConsentAccept(financeService.createBankAccount(that.userWillPerform));
                } else {
                    $scope.terms = 0;
                    $scope.isWillPerform = false;
                    $scope.userModalPerformShow = 1;
                }
            };

            this.termsConsentAccept = function (fn) {
                var consentData = {
                    data: {
                        attributes: {
                            "terms-agreement-id": that.termsId,
                            "user-id": authService.userId().id,
                            "job-id": $routeParams.id
                        }
                    }
                };
                Resources.termsConsents.create({}, consentData, function (result) {
                    if (fn) {
                        fn();
                    }
                }, function (err) {
                    /*$scope.terms = 0;
                     $scope.isWillPerform = false;
                     $scope.userModalPerformShow = 1;*/
                    if (fn) {
                        fn();
                    }
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

            this.showBIC = function () {
                $scope.isShowBIC = true;
                that.financeModel.data.attributes['account-clearing-number'] = "";
                that.financeModel.data.attributes['account-number'] = "";
            };

            this.hideBIC = function () {
                $scope.isShowBIC = false;
                that.financeModel.data.attributes.bic = "";
                that.financeModel.data.attributes.iban = "";
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

        }])
    .controller('ArriverJobsCommentsCtrl', ['jobService', 'authService', 'i18nService', 'userService', 'companyService', 'commentService',
        'justFlowService', 'justRoutes', '$routeParams', '$scope', '$q', '$filter', '$http', 'settings', 'Resources', 'gtService',
        function (jobService, authService, i18nService, userService, companyService, commentService,
                  flow, routes, $routeParams, $scope, $q, $filter, $http, settings, Resources, gtService) {
            var that = this;
            this.model = commentService.getModel('jobs', $routeParams.id);
            this.message = {};

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.checkArriverUser(routes.global.start.url);
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
                    $scope.job.max_rate = found_hourly_pay[0].attributes.rate * response.data.attributes.hours;
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
        }]);


