/*
 angular.module('just.common')
 .controller('StartCtrl', ['i18nService', 'jobService', function (i18nService, jobService) {
 this.languages = i18nService.supportedLanguages();

 this.jobs = jobService.getJobs();

 this.language = 'sv';
 this.selectLanguage = function () {
 i18nService.useLanguage(this.language);
 };

 }]);

 */

angular.module('just.common')
    .controller('StartCtrl', ['i18nService', 'authService', 'userService', 'companyService', 'jobService', '$scope', '$filter', '$q', 'Resources', 'gtService',
        function (i18nService, authService, userService, companyService, jobService, $scope, $filter, $q, Resources, gtService) {
            var that = this;

            $scope.today = new Date();

            $scope.$parent.ctrl.isStartPage = true;

            this.languages = i18nService.supportedLanguages();

            authService.checkPromoCode();

            i18nService.addLanguageChangeListener(that.translateText);

            this.translateText = function(){
                angular.forEach(that.jobs.data, function (obj, idx) {
                    that.translateJobDataWord(idx);
                });
            };

            this.translateJobDataWord = function(idx){
                if (that.jobs.data[idx].attributes.name) {
                    gtService.translate(that.jobs.data[idx].attributes.name)
                        .then(function (translation) {
                            that.jobs.data[idx].translation = {};
                            that.jobs.data[idx].translation.text = translation.translatedText;
                            that.jobs.data[idx].translation.from = translation.detectedSourceLanguage;
                            that.jobs.data[idx].translation.from_name = translation.detectedSourceLanguageName;
                            that.jobs.data[idx].translation.from_direction = translation.detectedSourceLanguageDirection;
                            that.jobs.data[idx].translation.to = translation.targetLanguage;
                            that.jobs.data[idx].translation.to_name = translation.targetLanguageName;
                            that.jobs.data[idx].translation.to_direction = translation.targetLanguageDirection;
                        });
                }
            };

            this.getNewJob = function () {
                that.jobs = jobService.getJobsNoFilled('company,hourly-pay');
                that.jobs.$promise.then(function (response) {
                    var deferd = $q.defer();

                    angular.forEach(response.data, function (obj, idx) {
                        that.jobs.data[idx].company_image = "assets/images/content/placeholder-logo.png";
                        that.translateJobDataWord(idx);
                    });

                    angular.forEach(response.data, function (obj, idx) {
                        var found_hourly_pay = $filter('filter')(response.included, {
                            id: "" + obj.relationships["hourly-pay"].data.id,
                            type: "hourly-pays"
                        }, true);
                        if (found_hourly_pay.length > 0) {
                            if ($scope.$parent) {
                                that.jobs.data[idx].max_rate = (($scope.$parent.ctrl.isCompany === 1) ? found_hourly_pay[0].attributes["rate-excluding-vat"] : found_hourly_pay[0].attributes["gross-salary"]);
                            } else {
                                that.jobs.data[idx].max_rate = found_hourly_pay[0].attributes["gross-salary"];
                            }

                            that.jobs.data[idx].total_rate = that.jobs.data[idx].max_rate * that.jobs.data[idx].attributes.hours;
                            that.jobs.data[idx].currency = found_hourly_pay[0].attributes.currency;
                        }


                        var found = $filter('filter')(response.included, {
                            id: "" + obj.relationships.company.data.id,
                            type: "companies"
                        }, true);
                        if (found.length > 0) {
                            if (found[0].relationships["company-images"].data.length > 0) {
                                var getCompany = companyService.getCompanyById(found[0].id);
                                if (getCompany) {
                                    var found_image = $filter('filter')(getCompany.included, {type: 'company-images'}, true);
                                    if (found_image) {
                                        if (found_image.length > 0) {
                                            that.jobs.data[idx].company_image = found_image[0].attributes["image-url-small"];
                                        }
                                    }
                                } else {
                                    Resources.company.get({
                                        company_id: found[0].id,
                                        'include': 'company-images'
                                    }, function (result0) {
                                        var found_image = $filter('filter')(result0.included, {type: 'company-images'}, true);
                                        if (found_image) {
                                            if (found_image.length > 0) {
                                                that.jobs.data[idx].company_image = found_image[0].attributes["image-url-small"];
                                            }
                                        }
                                        companyService.addList(result0);
                                    });
                                }
                            }
                        }
                    });

                    return deferd.promise;
                });
            };
            if (authService.isAuthenticated() && userService.user.$promise) {
                userService.user.$promise.then(that.getNewJob);
            } else {
                this.getNewJob();
            }

            this.language = 'sv';
            this.selectLanguage = function () {
                i18nService.useLanguage(this.language);
            };

            $scope.jobGalleryResponsive = [
                {
                    breakpoint: 1920,
                    settings: {
                        slidesToShow: 10,
                        slidesToScroll: 10
                    }
                },
                {
                    breakpoint: 1600,
                    settings: {
                        slidesToShow: 9,
                        slidesToScroll: 9
                    }
                },
                {
                    breakpoint: 1440,
                    settings: {
                        slidesToShow: 8,
                        slidesToScroll: 8
                    }
                },
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7
                    }
                }, {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 6,
                        slidesToScroll: 6
                    }
                },
                {
                    breakpoint: 980,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                },
                {
                    breakpoint: 500,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 375,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                }
            ];
        }]);
