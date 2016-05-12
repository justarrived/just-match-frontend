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
                this.message = response;
                flow.reload(routes.global.reset_password_confirm.resolve($routeParams.token));

            });
        };
    }]);
