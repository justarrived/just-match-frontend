angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'authService', '$scope', 'justFlowService', 'justRoutes', 'Resources', '$q', function (companyService, authService, $scope, flow, routes, Resources, $q) {
        var that = this;

        this.data = companyService.registerModel;
        this.registerMessage = companyService.signinMessage;

        if (authService.isAuthenticated()) {
            flow.redirect(routes.global.start.url);
        }


        $scope.isAddNewCIN = false;
        //$scope.data = {};
        this.data.cin = "";
        this.selectedCompany = {};
        $scope.regex = '\\d+';
        $scope.disableInput = true;
        $scope.isNew = 0;

        this.process = function () {
            if ($scope.isNew === 1) {
                //Register and choose new company
                companyService.register(that.data);
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
                that.data.email = "";
                that.data.phone = "";
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
                $scope.disableInput = false;
                $scope.isNew = 1;
                that.selectedCompany = {};
            }
        };

        $scope.searchAsync = function (term) {
            // No search term: return initial items
            angular.element(".custom-select-action").find(".btn.add-button").prop("disabled", "disabled");
            var searchParam = {
                'page[number]': 1,
                'page[size]': 50
            };
            if (!term) {
                term = '';
                $scope.searchTerm = '';
            }else{
                searchParam["filter[cin]"] = term;
            }
            $scope.searchTerm = term;

            var deferd = $q.defer();
            $scope.companies = Resources.companies.get(searchParam);
            $scope.companies.$promise.then(function (response) {
                $scope.companies = response;
                var result = [];
                angular.forEach(response.data, function (obj, key) {
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

