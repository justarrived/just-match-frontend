angular.module('just.common')
    .directive('passwordMatch', function () {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, elem, attrs, control) {
                var checker = function () {
                    var e1 = scope.$eval(attrs.ngModel);
                    var e2 = scope.$eval(attrs.passwordMatch);
                    return e1 === e2;
                };
                scope.$watch(checker, function (n) {
                    control.$setValidity("unique", n);
                });
            }
        };
    })
    .controller('RegisterCtrl', ['authService', 'userService', 'justFlowService', 'justRoutes', '$scope',
        function (authService, userService, flow, routes, $scope) {
            var that = this;

            if (authService.isAuthenticated()) {
                flow.replace(routes.user.user.url);
            }

            this.data = userService.registerModel;
            this.message = userService.registerMessage;

            if (flow.next_data) {
                if(flow.next_data.data){
                    this.data.company_id = flow.next_data.data.id;
                }
            }

            $scope.$watch('form', function (form) {
                if (form) {
                    if (that.message.data) {
                        angular.forEach(that.message.data.errors, function (obj, key) {
                            var pointer_arr = obj.source.pointer.split("/");
                            var field_name = pointer_arr[pointer_arr.length - 1];
                            field_name = field_name.replace(/-/g, "_");
                            $scope.form[field_name].error_detail = obj.detail;
                        });

                    }
                }
            });

            this.process = function () {
                var element0 = angular.element("#file_upload");
                if (element0[0].files[0]) {
                    var formData = new FormData();
                    var element = angular.element("#file_upload");
                    formData.append("image", element[0].files[0]);
                    userService.register(that.data, formData);
                } else {
                    userService.register(that.data);
                }

            };
        }]);
