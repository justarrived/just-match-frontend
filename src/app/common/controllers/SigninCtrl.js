angular.module('just.common')
    .controller('SigninCtrl', ['$scope', 'authService', 'userService', 'justFlowService', 'justRoutes',
        function ($scope, authService, userService, flow, routes) {
            var that = this;

            if (authService.isAuthenticated()) {
                flow.redirect(routes.user.user.url);
            }

            this.data = userService.signinModel;
            this.message = userService.signinMessage;
            this.process = function () {
                userService.signin(that.data);
            };
        }]
    );
