angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'authService', 'userService', '$scope', 'justFlowService', 'justRoutes', 'Resources', '$q', '$filter', 'settings', 'httpPostFactory',
        function (companyService, authService, userService, $scope, flow, routes, Resources, $q, $filter, settings, httpPostFactory) {
            var that = this;

            this.data = companyService.registerModel;
            this.message = companyService.registerMessage;
            this.messageU = userService.registerMessage;
            this.company_image = "assets/images/content/placeholder-logo.png";


            if (authService.isAuthenticated()) {
                flow.redirect(routes.global.start.url);
            }

            $scope.isAddNewCIN = false;
            //$scope.data = {};

            this.selectedCompany = {};
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

            Resources.companyTermsAgreements.get(function(result){
                that.termsId = result.data.id;
                that.termsAgreements = result.data.attributes.url;
            });

            $scope.$watch('form', function (form) {
                if (form) {
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
                }
            });

            this.process = function () {
                that.data.terms_id = that.termsId;
                if ($scope.isNew === 1) {
                    // Register and choose new company
                    companyService.register(that.data);
                } else {
                    //Choose stored company
                    companyService.choose(that.data);
                }
            };

            $scope.companyOptions = {
                async: true,
                onSelect: function (item) {
                    $scope.isAddNewCIN = false;
                    that.data.cin = "";
                    that.data.id = item.id;
                    that.data.name = item.attributes.name;
                    that.data.website = item.attributes.website;
                    that.data.firstname = "";
                    that.data.lastname = "";
                    that.data.email = item.attributes.email;
                    that.data.phone = item.attributes.phone;
                    that.data.street = item.attributes.street;
                    that.data.zip = item.attributes.zip;
                    that.data.city = item.attributes.city;
                    that.data.company_id = item.id;
                    that.data["company-image-one-time-token"] = "";
                    that.company_image = item.company_image;
                    //$scope.isShowLogo = item.haveLogo;
                    $scope.isShowLogo = 1;
                    $scope.disableInput = true;
                    $scope.isNew = 0;
                    that.selectedCompany.data = item;
                },
                addText: 'Create new company',
                onAdd: function () {
                    $scope.isAddNewCIN = true;
                    that.data.cin = $scope.searchTerm;
                    that.data.id = "";
                    that.data.name = "";
                    that.data.website = "";
                    that.data.firstname = "";
                    that.data.lastname = "";
                    that.data.email = "";
                    that.data.phone = "";
                    that.data.street = "";
                    that.data.zip = "";
                    that.data.city = "";
                    that.data.company_id = "";
                    that.data["company-image-one-time-token"] = "";
                    that.company_image = "assets/images/content/placeholder-logo.png";
                    $scope.isShowLogo = 0;
                    $scope.disableInput = false;
                    $scope.isNew = 1;
                    that.selectedCompany = {};
                }
            };

            $scope.searchAsync = function (term) {
                // No search term: return initial items
                angular.element(".custom-select-action").find(".btn.add-button").prop("disabled", "disabled");
                var searchParam = {
                    'include': 'company-images',
                    'page[number]': 1,
                    'page[size]': 50,
                };
                if (!term) {
                    term = '';
                    $scope.searchTerm = '';
                } else {
                    searchParam["filter[cin]"] = term;
                }
                $scope.searchTerm = term;

                var deferd = $q.defer();
                $scope.companies = Resources.companies.get(searchParam);
                $scope.companies.$promise.then(function (response) {
                    $scope.companies = response;
                    var result = [];
                    angular.forEach(response.data, function (obj, key) {
                        obj.attributes.name_cin = obj.attributes.name + " (" + obj.attributes.cin + ")";
                        obj.company_image = "assets/images/content/placeholder-logo.png";
                        obj.haveLogo = 0;
                        if (obj.relationships["company-images"].data.length > 0) {
                            var found = $filter('filter')(response.included, {
                                id: obj.relationships["company-images"].data[0].id,
                                type: 'company-images'
                            }, true);
                            if (found.length > 0) {
                                obj.company_image = found[0].attributes["image-url-medium"];
                                obj.haveLogo = 1;
                            }
                        }
                        result.push(obj);
                    });
                    if (result.length <= 0 && $scope.searchTerm.length === 10) {
                        angular.element(".custom-select-action").find(".btn.add-button").prop("disabled", "");
                    }
                    deferd.resolve(result);
                });

                return deferd.promise;
            };

            $scope.fileNameChanged = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload");

                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'companies/images', formData, function (callback) {
                        that.data['company-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.company_image = callback.data.attributes["image-url-small"];
                    });
                }
            };

            $scope.fileNameChanged2 = function () {
                // UPLOAD IMAGE
                var element = angular.element("#file_upload2");
                if (element[0].files[0]) {
                    var formData = new FormData();

                    var element0 = angular.element("#file_upload2");

                    formData.append("image", element0[0].files[0]);
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                        that.data['user-image-one-time-token'] = callback.data.attributes["one-time-token"];
                        that.user_image = callback.data.attributes["image-url-small"];
                    });
                }
            };

        }]);

