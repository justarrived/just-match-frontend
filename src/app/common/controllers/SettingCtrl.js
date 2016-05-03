angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'userService','$scope', function (flow, routes, userService,$scope) {
        var that = this;

        $scope.model = userService.userModel();

        $scope.$on('onSignin', function(event, obj) {
            $scope.model = userService.userModel();
        });

    }]);
