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
    .controller('RegisterCtrl', ['authService', 'userService', 'justFlowService', 'justRoutes', '$scope', 'httpPostFactory', 'settings',
        function (authService, userService, flow, routes, $scope, httpPostFactory, settings) {
            var that = this;

            if (authService.isAuthenticated()) {
                flow.replace(routes.job.list.url);
            }

            this.data = userService.registerModel;
            this.message = userService.registerMessage;

            if (flow.next_data) {
                if (flow.next_data.data) {
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

            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");

                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.data['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                    });
                }
            };

            this.process = function () {
                /*var element0 = angular.element("#file_upload");
                 if (element0[0].files[0]) {
                 var formData = new FormData();
                 var element = angular.element("#file_upload");
                 formData.append("image", element[0].files[0]);
                 userService.register(that.data, formData);
                 } else {
                 userService.register(that.data);
                 }*/
                userService.register(that.data);
            };
        }]);
