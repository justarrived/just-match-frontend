angular.module('just.common')
    .directive("scroll", function ($window) {
        return function (scope, element, attrs) {
            angular.element($window).bind("scroll", function () {
                function getDocHeight() {
                    return Math.max(
                        document.body.scrollHeight, document.documentElement.scrollHeight,
                        document.body.offsetHeight, document.documentElement.offsetHeight,
                        document.body.clientHeight, document.documentElement.clientHeight
                    );
                }

                var footerHeight = angular.element("footer").height();
                var windowHeight = window.innerHeight;
                var docHeight = getDocHeight() - footerHeight;
                if ((this.pageYOffset + windowHeight) <= docHeight) {
                    element.addClass('sticky');
                } else {
                    element.removeClass('sticky');
                }
            });
        };
    })

    .controller('MainCtrl', ['authService', '$location', 'justFlowService', 'justRoutes', 'i18nService', '$scope', 'Resources', '$filter',
        function (authService, $location, flow, routes, i18nService, $scope, Resources, $filter) {
            var that = this;
            this.showSetting = false;

            this.signedIn = function () {
                return authService.isAuthenticated();
            };
            this.signout = function () {
                authService.logout();
                flow.completed(routes.global.start.url);
                this.menu(0);
            };
            this.signin = function () {
                var path = $location.path();
                flow.redirect(routes.user.signin.url, function () {
                    flow.redirect(path);
                    that.getUser();
                });
                this.menu(0);
            };
            this.updateLanguage = function () {
                i18nService.getLanguage().then(function (lang) {
                    that.language = lang;
                });
            };
            i18nService.addLanguageChangeListener(function () {
                that.updateLanguage();
            });

            this.selectLanguage = function (show) {
                //show = 1 : force open
                //show = 0 : force hide
                //show = undefined : toggle
                show = show | !routes.global.isSelectLanguageOpen;
                routes.global.isSelectLanguageOpen = show;
            };
            this.menu = function (show) {
                //show = 1 : force open
                //show = 0 : force hide
                //show = undefined : toggle
                show = show | !routes.global.isMainMenuOpen;
                routes.global.isMainMenuOpen = show;
            };

            this.getUser = function () {
                if (that.signedIn()) {
                    that.user = Resources.user.get({
                        id: authService.userId().id,
                        "include": "user-images"
                    }, function (response) {
                        that.user.data.attributes.user_image = 'assets/images/content/hero.png';
                        if(response.data.relationships["user-images"].data.length > 0){
                            var found_img = $filter('filter')(response.included, {
                                type: response.data.relationships["user-images"].data[0].type
                            }, true);
                            if (found_img.length > 0) {
                                that.user.data.attributes.user_image  = found_img[0].attributes["image-url-small"];
                            }
                        }
                    });
                }
            };

            this.getUser();

            this.updateLanguage();
        }]
    );
