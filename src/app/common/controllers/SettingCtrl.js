angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'i18nService', 'userService', '$scope', 'Resources',
        function (flow, routes, authService, i18nService, userService, $scope, Resources) {
            var that = this;
            this.languageList = "";
            this.allLangauge = i18nService.allLangauge;

            $scope.model = userService.userModel();


            $scope.$on('onSignin', function (event) {
                $scope.model = userService.userModel();
            });

            this.companyProfileUpdate = function () {

            };

        }]);
