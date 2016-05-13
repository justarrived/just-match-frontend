angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:ResetPasswordCtrl
     *
     */
    .controller('ResetPasswordCtrl', ['authService', '$routeParams', 'Resources', 'justFlowService', 'justRoutes', function (authService, $routeParams, Resources, flow, routes) {
        var that = this;

        this.model = {data: {attributes: {"one-time-token": $routeParams.token, "password": undefined}}};
        this.message = "";

        if (authService.isAuthenticated()) {
            flow.replace(routes.global.start.url);
        }

        this.changePassword = function () {
            Resources.userChangePassword.create({}, that.model, function () {
                flow.replace(routes.user.signin.url);
            }, function (response) {
                that.message = "error";
                //flow.reload(routes.global.reset_password_confirm.resolve($routeParams.token));
            });
        };
    }])


    /**
     * @ngdoc controller
     * @name just.common.controller:ForgotPasswordCtrl
     *
     */
    .controller('ForgotPasswordCtrl', ['authService', 'userService', 'justFlowService', 'justRoutes', function (authService, userService, flow, routes) {
        var that = this;

        this.resetSuccess = false;

        if (authService.isAuthenticated()) {
            flow.replace(routes.global.start.url);
        }

        this.reset_password = function () {
            userService.reset_password(that.data.email, that.fn);
        };

        this.fn = function (val, result) {
            if (val === 0) {
                that.resetSuccess = false;
                that.message = result;
            } else {
                that.resetSuccess = true;
                //console.log(result);
            }
        };
    }]);
