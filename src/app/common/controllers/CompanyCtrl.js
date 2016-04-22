angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'authService', '$scope', 'justFlowService', 'justRoutes', 'Resources', '$http', '$q', 'settings', function (companyService, authService, $scope, flow, routes, Resources, $http, $q, settings) {
        var that = this;

        this.data = companyService.registerModel;
        this.registerMessage = companyService.signinMessage;

        if (!authService.isAuthenticated()) {
            flow.redirect(routes.user.select.url, function () {
                flow.next(routes.company.register.url);
            });
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
            if (!term) {
                $scope.searchTerm = '';
                term = '';
            } else {
                $scope.searchTerm = term;
                term = '&filter[cin]=' + term;
            }

            var deferd = $q.defer();
            var url = settings.just_match_api + settings.just_match_api_version + "companies?page[number]=1&page[size]=50" + term;
            $http.get(url)
                .then(function (response) {
                    var result = [];
                    angular.forEach(response.data.data, function (obj, key) {
                        result.push(obj);
                    });
                    if (result.length <= 0 && $scope.searchTerm.length === 10) {
                        angular.element(".custom-select-action").find(".btn.add-button").prop("disabled", "");
                    }
                    deferd.resolve(result);
                }, function (err) {
                    deferd.reject(err);
                });
            return deferd.promise;
        };
    }
    ])
    .controller('CompanyCreateJobCtrl', ['companyService', '$scope', 'justFlowService', 'justRoutes', 'Resources', 'jobService', function (companyService, $scope, flow, routes, Resources, jobService) {
        var that = this;

        if (!flow.next_data) {
            flow.next(routes.company.register.url);
        }

        this.text = {
            title: 'assignment.new.title',
            submit: 'assignment.new.form.next'
        };

        this.model = jobService.jobModel;
        this.message = jobService.jobMessage;
        this.model.data.attributes.hours = 1;
        this.rates = jobService.rates();
        this.save = function () {
            jobService.companyCreate(that.model);
        };
        //How to config job company?
    }]);

