angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'authService', '$scope', 'justFlowService', 'justRoutes', 'Resources', '$q', '$filter',
        function (companyService, authService, $scope, flow, routes, Resources, $q, $filter) {
            var that = this;

            this.data = companyService.registerModel;
            this.registerMessage = companyService.signinMessage;
            this.company_image = "assets/images/content/placeholder-logo.png";

            if (authService.isAuthenticated()) {
                flow.redirect(routes.global.start.url);
            }

            $scope.isAddNewCIN = false;
            //$scope.data = {};
            this.data.cin = "";
            this.selectedCompany = {};
            $scope.regex = '\\d+';
            $scope.disableInput = true;
            $scope.isNew = -1;

            this.process = function () {
                if ($scope.isNew === 1) {
                    //Register and choose new company

                    // GENERATE FORMDATA FOR UPLOAD IMAGE
                    var element0 = angular.element("#file_upload");
                    if (element0[0].files[0]) {
                        var formData = new FormData();
                        var element = angular.element("#file_upload");
                        formData.append("image", element[0].files[0]);
                        companyService.register(that.data, formData);
                    } else {
                        companyService.register(that.data);
                    }
                } else {
                    //Choose stored company
                    companyService.choose(that.selectedCompany);
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
                    that.company_image = item.company_image;
                    $scope.disableInput = true;
                    $scope.isNew = 0;
                    that.selectedCompany.data = item;
                },
                addText: 'Add new CIN',
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
                    that.company_image = "assets/images/content/placeholder-logo.png";
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
                        if(obj.relationships["company-images"].data.length > 0){
                            var found = $filter('filter')(response.included, {
                                id: obj.relationships["company-images"].data[0].id,
                                type: 'company-images'
                            }, true);
                            if(found.length>0){
                                obj.company_image = found[0].attributes["image-url-medium"];
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
        }]);

