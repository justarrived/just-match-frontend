angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'userService', '$scope', 'Resources',
        function (flow, routes, authService, userService, $scope, Resources) {
            var that = this;
            this.languageList = "";
            this.isCompany = userService.isCompany;

            $scope.model = userService.userModel();


            $scope.$on('onSignin', function (event) {
                $scope.model = userService.userModel();
            });




        }]);
