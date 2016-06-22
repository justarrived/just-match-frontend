angular.module('just.common')
    .controller('ChatCtrl', ['authService', 'i18nService', 'justFlowService', 'justRoutes', 'userService', 'companyService',
        'jobService', '$scope', '$q', '$filter', 'Resources', '$routeParams', 'chatService', '$http', 'settings', 'gtService',
        function (authService, i18nService, flow, routes, userService, companyService,
                  jobService, $scope, $q, $filter, Resources, $routeParams, chatService, $http, settings, gtService) {
            var that = this;

            this.candidate_model = {};

            this.disableChat = true;

            this.chatId = $routeParams.chat_id;
            this.chatModel = chatService.chatModel;
            this.chatMessageModel = chatService.chatMessageModel;
            this.user_apply = {};
            $scope.chatCompany = {};

            authService.checkPromoCode().then(function (resp) {
                if (resp !== 0) {
                    userService.needSignin();
                } else {
                    return;
                }
            });

            i18nService.addLanguageChangeListener(function () {
                that.getChatMessage();
                that.translateCandidate(that.candidate_model);
            });

            if (authService.isAuthenticated()) {
                this.userModel = userService.userModel();

                if (this.userModel.$promise) {
                    this.userModel.$promise.then(function (response) {
                        that.isCompany = userService.isCompany;
                        if (userService.isCompany === 1) {
                            that.initDataCompany();
                        }else{
                            that.initDataArriver();
                        }
                    });
                } else {
                    that.isCompany = userService.isCompany;
                    if (userService.isCompany === 1) {
                        that.initDataCompany();
                    }else{
                        that.initDataArriver();
                    }
                }
            }

            this.setChatHeaderData = function(response){
                var keepGoing = true;
                angular.forEach(response.included, function (obj, key) {
                    if (keepGoing) {
                        if (obj.type.toLowerCase() === 'users') {
                            if (obj.id !== ("" + authService.userId().id)) {
                                keepGoing = false;
                                if(userService.isCompany === 1){
                                    that.setUserData(obj);
                                }else{
                                    that.setCompanyData(obj);
                                }
                            }
                        }
                    }
                });
            };

            // ARRIVER USER GET DATA
            this.initDataArriver = function(){
                $scope.currTab = 3;
                chatService.setChatId(that.chatId, that.setChatHeaderData);
                that.getChatMessage();
                that.disableChat = false;
            };

            this.setCompanyData = function(userObj){
                $scope.chatCompany.owner = userObj;
                $scope.chatCompany.company_image = "assets/images/content/placeholder-logo.png";

                if(userObj.relationships.company.data !== null){
                    var getCompany = companyService.getCompanyById(userObj.relationships.company.data.id);
                    if (getCompany) {
                        console.log("found");
                        console.log(getCompany);
                        $scope.chatCompany = getCompany.data;
                        var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                        if (found_image) {
                            if (found_image.length > 0) {
                                $scope.chatCompany.company_image = found_image[0].attributes["image-url-small"];
                            }
                        }
                    } else {
                        Resources.company.get({
                            company_id: userObj.relationships.company.data.id,
                            'include': 'company-images'
                        }, function (result0) {
                            $scope.chatCompany = result0.data;
                            var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                            if (found_image) {
                                console.log("aaa");
                                if (found_image.length > 0) {
                                    $scope.chatCompany.company_image = found_image[0].attributes["image-url-small"];
                                }else{
                                    $scope.chatCompany.company_image = "assets/images/content/placeholder-logo.png";
                                }
                            }else{
                                $scope.chatCompany.company_image = "assets/images/content/placeholder-logo.png";
                            }
                            companyService.addList(result0);
                        });
                    }
                }
            };

            // COMPANY USER GET DATA
            this.initDataCompany = function () {
                $scope.currTab = 3;
                chatService.setChatId(that.chatId, that.setChatHeaderData);
                that.getChatMessage();
                that.disableChat = false;
            };

            this.setUserData = function (userObj) {
                if (userService.isCompany === 1) {
                    that.candidate_model = userObj.attributes;
                    that.setCandidateModelLanguage(userObj);
                    that.getUserPerformedJobs(userObj.id);
                    that.getUserRating(userObj.id);
                }
            };

            this.setCandidateModelLanguage = function (userObj) {
                that.candidate_model.languages = [];
                if (userObj.relationships.languages.data !== null) {
                    angular.forEach(userObj.relationships.languages.data, function (obj, key) {
                        Resources.language.get({id: obj.id}, function (response) {
                            that.candidate_model.languages.push(response.data);
                        });
                    });
                }
                that.translateCandidate(that.candidate_model);
            };

            this.getUserRating = function (user_id) {
                Resources.userRating.get({id: user_id}, function (result) {
                    that.user_apply.rating = result.meta["average-score"];
                });
            };

            this.setCompanyChatHeaderImage = function (imgUrl) {
                //SET ARRIVER USER IMAGE
                that.user_apply.user_image = imgUrl;
            };

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
            };

            // ALL USER CHAT DATA
            this.submitChat = function () {
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
                                that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-logo.png";
                                var getCompany = companyService.getCompanyById(found_author[0].relationships.company.data.id);
                                if (getCompany) {
                                    that.chatMessages.data[key].author.attributes["first-name"] = getCompany.data.attributes.name;
                                    var found_image_c = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                                    if (found_image_c) {
                                        if (found_image_c.length > 0) {
                                            that.chatMessages.data[key].author.user_image = found_image_c[0].attributes["image-url-small"];
                                        }
                                    }
                                } else {
                                    Resources.company.get({
                                        company_id: found_author[0].relationships.company.data.id,
                                        'include': 'company-images'
                                    }, function (result0) {
                                        that.chatMessages.data[key].author.attributes["first-name"] = result0.data.attributes.name;
                                        var found_image_c = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                        if (found_image_c) {
                                            if (found_image_c.length > 0) {
                                                that.chatMessages.data[key].author.user_image = found_image_c[0].attributes["image-url-small"];
                                            }
                                        }
                                    });
                                }
                            } else {
                                that.chatMessages.data[key].author = found_author[0];
                                if (found_author[0].relationships["user-images"].data.length > 0) {
                                    if (chatService.chatDetail.$promise) {
                                        chatService.chatDetail.$promise.then(function (chatDetailResult) {
                                            var found_image = $filter('filter')(chatDetailResult.included, {relationships: {user: {data: {id: '' + found_author[0].id}}}}, true);
                                            that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                                            if (found_image) {
                                                if (found_image.length > 0) {
                                                    that.chatMessages.data[key].author.user_image = found_image[0].attributes["image-url-small"];
                                                    if (!that.user_apply.user_image) {
                                                        that.setCompanyChatHeaderImage(that.chatMessages.data[key].author.user_image);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        var found_image = $filter('filter')(chatService.chatDetail.included, {relationships: {user: {data: {id: '' + found_author[0].id}}}}, true);
                                        that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                                        if (found_image) {
                                            if (found_image.length > 0) {
                                                that.chatMessages.data[key].author.user_image = found_image[0].attributes["image-url-small"];
                                                if (!that.user_apply.user_image) {
                                                    that.setCompanyChatHeaderImage(that.chatMessages.data[key].author.user_image);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    that.chatMessages.data[key].author.user_image = "assets/images/content/placeholder-profile-image.png";
                                    if (!that.user_apply.user_image) {
                                        that.setCompanyChatHeaderImage(that.chatMessages.data[key].author.user_image);
                                    }
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
                }, function (error) {
                    flow.replace(routes.global.start.url);
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

                if (count === 1) {
                    var scrollH = document.getElementById(objId).scrollHeight;
                    if (scrollH > objH) {
                        $("#" + objId).height(scrollH - 20);
                    }
                }
            };
        }]);