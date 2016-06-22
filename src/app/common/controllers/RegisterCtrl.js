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
    .controller('RegisterCtrl', ['authService', 'userService', 'justFlowService', 'justRoutes', '$scope', 'httpPostFactory', 'settings', '$translate',
        function (authService, userService, flow, routes, $scope, httpPostFactory, settings, $translate) {
            var that = this;
            this.uploading = false;

            authService.checkPromoCode();

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

            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");

                    formData.append("image", element0[0].files[0]);
                    that.uploading = true;
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.data['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                        that.uploading = false;
                    }, function (err) {
                        that.uploading = false;
                    });
                }
            };

            this.process = function () {
                that.message = {};
                userService.register(that.data, that.errorMessage);
            };

            this.errorMessage = function () {
                that.message = userService.registerMessage;
                if (that.message.data) {
                    angular.forEach(that.message.data.errors, function (obj, key) {
                        var pointer_arr = obj.source.pointer.split("/");
                        var field_name = pointer_arr[pointer_arr.length - 1];
                        field_name = field_name.replace(/-/g, "_");
                        if ($scope.form[field_name]) {
                            $scope.form[field_name].error_detail = obj.detail;
                        }
                    });
                }
            };

            this.checkSSN = function () {
                if (that.data.ssn) {
                    var tmpSSN = that.data.ssn.replace(/-/g, "");
                    if (tmpSSN.length !== 10) {
                        $translate('user.form.ssn.validation').then(function (text) {
                            $scope.form.ssn.error_detail = text;
                        });
                    }
                }
            };
        }]);
