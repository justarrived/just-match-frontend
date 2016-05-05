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
    .controller('StartCtrl', ['i18nService', 'jobService', '$scope', '$filter', '$q', 'Resources',
        function (i18nService, jobService, $scope, $filter, $q, Resources) {
            var that = this;

            this.languages = i18nService.supportedLanguages();

            this.jobs = jobService.getJobs('company');
            this.jobs.$promise.then(function (response) {
                var deferd = $q.defer();

                angular.forEach(response.data, function (obj, idx) {
                    that.jobs.data[idx].company_image = "assets/images/content/placeholder-logo.png";
                });

                angular.forEach(response.data, function (obj, idx) {

                    var found = $filter('filter')(response.included, {id: "" + obj.relationships.company.data.id}, true);
                    if (found.length > 0) {
                        if (found[0].relationships["company-images"].data.length > 0) {
                            Resources.companyImage.get({
                                company_id: found[0].id,
                                id: found[0].relationships["company-images"].data[0].id
                            }, function (result) {

                                that.jobs.data[idx].company_image = result.data.attributes["image-url-small"];
                            });
                        }
                    }
                });

                return deferd.promise;
            });

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

            $scope.instructionsResponsive = [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ];

        }]);