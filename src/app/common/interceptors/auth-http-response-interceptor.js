angular.module('just.service')
    .factory('authHttpResponseInterceptor', ['$q', '$location', '$injector', 'justRoutes',
        function($q, $location, $injector, routes) {
            function redirectToLogin() {
                var authService = $injector.get('authService');
                var userService = $injector.get('userService');
                authService.logout();
                userService.clearUserModel();

                $location.path(routes.user.signin.url);
            }

            return {
                response: function(response) {
                    if (response.status === 401) {
                        redirectToLogin();
                        return response;
                    }
                    return response || $q.when(response);
                },
                responseError: function(rejection) {
                    if (rejection.status === 401) {
                        redirectToLogin();
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
