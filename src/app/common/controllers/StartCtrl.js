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
    .controller('StartCtrl', ['i18nService', 'jobService', '$scope', function (i18nService, jobService, $scope) {
        this.languages = i18nService.supportedLanguages();

        this.jobs = jobService.getJobs();

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
            },{
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