angular.module('just.common')
    .controller('SigninCtrl', ['$scope', 'authService', 'userService', 'justFlowService', 'justRoutes',
        function ($scope, authService, userService, flow, routes) {
            var that = this;
            this.resetSuccess = false;

            if (authService.isAuthenticated()) {
                flow.redirect(routes.user.user.url);
            }

            this.data = userService.signinModel;
            this.message = userService.signinMessage;

            this.process = function () {
                userService.signin(that.data);
            };

            this.reset_password = function () {
                if($scope.form.email.$invalid){
                    //$scope.form.email.error_detail = "Email required";
                    $scope.form.email.$setTouched();
                }else{
                    console.log($scope.form.email);
                    userService.reset_password(that.data.email, that.fn);
                }
            };

            this.fn = function (val, result) {
                if (val === 0) {
                    that.resetSuccess = false;
                    that.message = result;
                } else {
                    that.resetSuccess = true;
                    console.log(result);
                }
            };
        }]
    );
