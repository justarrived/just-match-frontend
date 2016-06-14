angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'authService', 'userService', '$scope', 'justFlowService', 'justRoutes', 'Resources', '$q', '$filter', 'settings', 'httpPostFactory', '$translate',
        function (companyService, authService, userService, $scope, flow, routes, Resources, $q, $filter, settings, httpPostFactory, $translate) {
            var that = this;

            this.data = companyService.registerModel;
            this.message = companyService.registerMessage;
            this.messageU = userService.registerMessage;
            this.company_image = "assets/images/content/placeholder-logo.png";
            this.uploadingCompany = false;
            this.uploadingUser = false;

            authService.checkPromoCode();

            if (authService.isAuthenticated()) {
                flow.redirect(routes.global.start.url);
            }

            $scope.isAddNewCIN = false;
            //$scope.data = {};

            //this.selectedCompany = {};
            $scope.regex = '\\d+';
            $scope.disableInput = true;
            $scope.isNew = -1;
            this.isShowLogo = 0;

            if (this.message.data && that.data.id === "") {
                $scope.isAddNewCIN = true;
                $scope.isShowLogo = 0;
                $scope.disableInput = false;
                $scope.isNew = 1;
            } else {
                this.data.cin = "";
            }

            Resources.companyTermsAgreements.get(function (result) {
                that.termsId = result.data.id;
                that.termsAgreements = result.data.attributes.url;
            });


            this.process = function () {
                that.data.terms_id = that.termsId;
                that.message = {};
                that.messageU = {};

                if ($scope.isNew === 0) {
                    //choose company
                    companyService.choose(that.data, that.errorMessage);
                } else if ($scope.isNew === 1) {
                    //new company;
                    companyService.register(that.data, that.errorMessage, that.companyRegisterSuccess);
                } else {
                    //first process check cin from api
                    that.checkCompanyByCin();
                }
            };

            this.checkCompanyByCin = function () {
                var tmpCIN = that.data.cin.replace(/-/g,"");
                if(tmpCIN.length === 10){
                    var searchParam = {
                        'include': 'company-images',
                        'filter[cin]': that.data.cin.replace(/-/g,"")
                    };
                    $scope.companies = Resources.companies.get(searchParam);
                    $scope.companies.$promise.then(function (response) {
                        if (response.data.length > 0) {
                            //found
                            var item = response.data[0];
                            item.company_image = "assets/images/content/placeholder-logo.png";
                            if (item.relationships["company-images"].data.length > 0) {
                                var found = $filter('filter')(response.included, {
                                    id: item.relationships["company-images"].data[0].id,
                                    type: 'company-images'
                                }, true);
                                if (found.length > 0) {
                                    item.company_image = found[0].attributes["image-url-medium"];
                                }
                            }

                            that.data.id = item.id;
                            that.data.name = item.attributes.name;
                            that.data.website = item.attributes.website;
                            that.data.firstname = "";
                            that.data.lastname = "";
                            //that.data.email = item.attributes.email;
                            //that.data.phone = item.attributes.phone;
                            that.data.street = item.attributes.street;
                            that.data.zip = item.attributes.zip;
                            that.data.city = item.attributes.city;
                            that.data.company_id = item.id;
                            that.data["company-image-one-time-token"] = "";
                            that.company_image = item.company_image;
                            $scope.isShowLogo = 1;
                            $scope.disableInput = true;
                            $scope.isNew = 0;
                            companyService.choose(that.data, that.errorMessage);
                        } else {
                            //not found
                            that.clearCompanyData();
                            $scope.disableInput = false;
                            that.data.id = "";
                            $scope.isNew = 1;
                            setTimeout(function(){
                                document.getElementById("txt_company_name").focus();
                            },100);
                        }
                    });
                }else{
                    $translate('user.form.orgnr.validation').then(function (text) {
                        $scope.form.cin.error_detail = text;
                    });
                }

            };

            this.clearCompanyData = function () {
                that.data.id = undefined;
                that.data.name = "";
                that.data.website = "";
                that.data.firstname = "";
                that.data.lastname = "";
                //that.data.email = "";
                //that.data.phone = "";
                that.data.street = "";
                that.data.zip = "";
                that.data.city = "";
                that.data.company_id = "";
                that.data["company-image-one-time-token"] = "";
                that.company_image = "assets/images/content/placeholder-logo.png";
                $scope.isShowLogo = 0;
                $scope.disableInput = true;
                $scope.isNew = -1;
            };

            this.cinKeyup = function () {
                $scope.form.cin.error_detail = undefined;
                that.clearCompanyData();
            };

            this.companyRegisterSuccess = function () {
                $scope.isShowLogo = 1;
                $scope.disableInput = true;
                $scope.isNew = 0;
            };

            this.errorMessage = function () {
                that.message = companyService.registerMessage;

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

                that.messageU = userService.registerMessage;
                if (that.messageU.data) {
                    angular.forEach(that.messageU.data.errors, function (obj, key) {
                        var pointer_arr = obj.source.pointer.split("/");
                        var field_name = pointer_arr[pointer_arr.length - 1];
                        field_name = field_name.replace(/-/g, "_");
                        if ($scope.form[field_name]) {
                            $scope.form[field_name].error_detail = obj.detail;
                        }
                    });

                }
            };

            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");
                    that.uploadingCompany = true;
                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'companies/images', formData, function (callback) {
                        that.data['company-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.company_image = callback.data.attributes["image-url-small"];
                        that.uploadingCompany = false;
                    }, function (err) {
                        that.uploadingCompany = false;
                    });
                }
            };

            $scope.fileNameChanged2 = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload2");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload2");
                    that.uploadingUser = true;
                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.data['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                        that.uploadingUser = false;
                    }, function (err) {
                        that.uploadingUser = false;
                    });
                }
            };

        }]);

