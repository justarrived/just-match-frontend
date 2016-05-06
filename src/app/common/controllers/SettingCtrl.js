angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'userService', '$scope', 'Resources',
        function (flow, routes, authService, userService, $scope, Resources) {
            var that = this;
            this.languageList = "";

            $scope.model = userService.userModel();


            $scope.$on('onSignin', function (event) {
                $scope.model = userService.userModel();
                that.getLanguage();
            });

            this.getLanguage = function () {
                if (authService.isAuthenticated()) {
                    Resources.userLanguage.get({
                        user_id: authService.userId().id,
                        'include': 'language'
                    }, function (result) {
                        that.languageList = "";
                        angular.forEach(result.included, function (obj, idx) {
                            if (that.languageList !== "") {
                                that.languageList += ", ";
                            }
                            that.languageList += obj.attributes["en-name"];
                        });
                    });
                }
            };

            this.getLanguage();


        }]);
