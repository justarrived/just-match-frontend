angular.module('just.common')
    .controller('SettingCtrl', ['justFlowService', 'justRoutes', 'authService', 'i18nService', 'userService', '$scope', 'Resources', '$filter', 'settings', 'httpPostFactory',
        function (flow, routes, authService, i18nService, userService, $scope, Resources, $filter, settings, httpPostFactory) {
            var that = this;

            this.model = {data: {attributes: {}}};
            $scope.userModel = {};
            this.updateMessage = {};
            this.user_image = "assets/images/content/placeholder-logo.png";
            this.hasChangePassword=0;

            this.setUserModel = function () {
                $scope.userModel = userService.userModel();
                if ($scope.userModel.$promise) {
                    $scope.userModel.$promise.then(function (result) {
                        angular.copy(result.data.attributes, that.model.data.attributes);
                        that.user_image = result.data.user_image;
                        angular.element(".user-info-image").css("background-image", "url(" + result.data.user_image + ")");
                        that.model.data.attributes['language-id'] = '' + that.model.data.attributes['language-id'];
                    });
                } else {
                    angular.copy($scope.userModel.data.attributes, that.model.data.attributes);
                    that.user_image = $scope.userModel.data.user_image;
                    angular.element(".user-info-image").css("background-image", "url(" + $scope.userModel.data.user_image + ")");
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
                //Check need to update password
                that.hasChangePassword=0;
                if (that.model.data.attributes.password) {
                    // Test Login with email and old-password
                    authService.checkLogin({
                        data: {
                            attributes: {
                                email: userService.user.data.attributes.email,
                                password: that.model.data.attributes.old_password
                            }
                        }
                    }, that.checkLoginReturn);

                } else {
                    userService.saveUserModel(that.model, that.fn);
                }
            };

            this.checkLoginReturn = function (success, result) {
                if (success === 0) {
                    // Try Login not success return error
                    that.updateMessage = result;
                    angular.forEach(that.updateMessage.data.errors, function (obj, key) {
                        var field_name = "old_password";
                        field_name = field_name.replace(/-/g, "_");
                        $scope.form_profile[field_name].error_detail = obj.detail;
                    });
                }else{
                    // Test Login success update user data and set flag to get new auth token
                    that.hasChangePassword=1;
                    userService.saveUserModel(that.model, that.fn);
                }
            };

            this.fn = function (success, result) {
                if (success === 0) {
                    // update not success return error
                    that.updateMessage = result;
                    angular.forEach(that.updateMessage.data.errors, function (obj, key) {
                        var pointer_arr = obj.source.pointer.split("/");
                        var field_name = pointer_arr[pointer_arr.length - 1];
                        field_name = field_name.replace(/-/g, "_");
                        $scope.form_profile[field_name].error_detail = obj.detail;
                    });
                } else {
                    if(that.hasChangePassword ===0){
                        // not change password
                        that.setUserModel();
                        $scope.$parent.ctrl.saveSettingsSuccess = true;
                        $scope.$parent.ctrl.showSetting = false;
                        $scope.$parent.ctrl.getUser();
                    }else{
                        // change password clear old user data and re-login with email and new password
                        that.hasChangePassword = 0;
                        userService.clearUserModel();
                        authService.login({
                            data: {
                                attributes: {
                                    email: that.model.data.attributes.email,
                                    password: that.model.data.attributes.password
                                }
                            }
                        }).then(function (ok) {
                            userService.getUserDetail();
                            that.setUserModel();
                            $scope.$parent.ctrl.saveSettingsSuccess = true;
                            $scope.$parent.ctrl.showSetting = false;
                            $scope.$parent.ctrl.getUser();
                        });
                    }
                }
            };


        }]);
