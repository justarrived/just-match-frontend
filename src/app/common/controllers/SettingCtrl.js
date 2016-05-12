angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'i18nService', 'userService', '$scope', 'Resources', '$filter', 'settings', 'httpPostFactory',
        function (flow, routes, authService, i18nService, userService, $scope, Resources, $filter, settings, httpPostFactory) {
            var that = this;

            this.model = {data: {attributes: {}}};
            $scope.userModel = {};
            this.updateMessage = {};

            this.setUserModel = function () {
                $scope.userModel = userService.userModel();
                if ($scope.userModel.$promise) {
                    $scope.userModel.$promise.then(function (result) {
                        angular.copy(result.data.attributes, that.model.data.attributes);
                        angular.copy(result.data.user_image, that.user_image);
                        angular.element(".user-info-image").css("background-image","url("+result.data.user_image+")");
                        that.model.data.attributes['language-id'] = '' + that.model.data.attributes['language-id'];
                    });
                } else {
                    angular.copy($scope.userModel.data.attributes, that.model.data.attributes);
                    angular.copy($scope.userModel.data.user_image, that.user_image);
                    angular.element(".user-info-image").css("background-image","url("+$scope.userModel.data.user_image+")");
                    that.model.data.attributes['language-id'] = '' + that.model.data.attributes['language-id'];
                }
            };

            if (authService.isAuthenticated()) {
                that.setUserModel();
            }


            i18nService.supportedLanguages().then(function (langs) {
                that.languages = langs;
            });

            $scope.$on('onSignin', function (event) {
                that.setUserModel();
            });

            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");

                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.model.data.attributes['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                    });
                }

            };

            this.companyProfileUpdate = function () {
                userService.saveUserModel(that.model, that.fn);
            };

            this.fn = function (success, result) {
                if (success === 0) {
                    //console.log(result);
                    that.updateMessage = result;
                    angular.forEach(that.updateMessage.data.errors, function (obj, key) {
                        var pointer_arr = obj.source.pointer.split("/");
                        var field_name = pointer_arr[pointer_arr.length - 1];
                        field_name = field_name.replace(/-/g, "_");
                        $scope.form_profile[field_name].error_detail = obj.detail;
                    });
                } else {
                    that.setUserModel();
                    $scope.$parent.ctrl.showSetting = false;
                    $scope.$parent.ctrl.getUser();
                }
            };


        }]);
