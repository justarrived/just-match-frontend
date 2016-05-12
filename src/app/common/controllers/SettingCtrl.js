angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'i18nService', 'userService', '$scope', 'Resources',
        function (flow, routes, authService, i18nService, userService, $scope, Resources) {
            var that = this;

            this.model = {data:{attributes:{}}};
            $scope.userModel = {};
            this.registerModel = userService.registerModel;
            this.registerMessage = {};


            $scope.userModel = userService.userModel();
            if($scope.userModel.$promise){
                $scope.userModel.$promise.then(function(result){
                    that.model.data.attributes = result.data.attributes;
                });
            }else{
                that.model.data.attributes = $scope.userModel.data.attributes;
            }

            i18nService.supportedLanguages().then(function (langs) {
                that.languages = langs;
            });

            $scope.$on('onSignin', function (event) {
                $scope.userModel = userService.userModel();
            });

            this.companyProfileUpdate = function () {

            };

        }]);
