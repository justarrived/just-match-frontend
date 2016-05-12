angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'i18nService', 'userService', '$scope', 'Resources',
        function (flow, routes, authService, i18nService, userService, $scope, Resources) {
            var that = this;

            i18nService.supportedLanguages().then(function (langs) {
                that.languages = langs;
            });

            $scope.userModel = userService.userModel();


            $scope.$on('onSignin', function (event) {
                $scope.userModel = userService.userModel();
            });

            this.companyProfileUpdate = function () {

            };

        }]);
