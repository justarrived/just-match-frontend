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
    }
    ])
    .controller('CompanyCreateJobCtrl', ['companyService', '$scope', 'justFlowService', 'justRoutes', 'Resources', 'jobService', '$q', function (companyService, $scope, flow, routes, Resources, jobService, $q) {
        var that = this;
        /*
        if (!flow.next_data) {
            flow.next(routes.company.register.url);
            return;
        }

        this.text = {
            title: 'assignment.new.title',
            submit: 'assignment.new.form.next'
        };

        this.model = jobService.jobModel;
        this.message = jobService.jobMessage;
        this.model.data.attributes.hours = 1;

        this.model.data.relationships.company.data.id = flow.next_data.data.id;
        this.model.data.attributes['company-id'] = flow.next_data.data.id;

        //Get Hourly-Pay and set default as first option
        this.rates = {};
        $scope.getRate = function () {
            that.rates = jobService.rates();
            var deferd = $q.defer();
            that.rates.$promise.then(function (response) {
                that.rates = response;
                that.model.data.attributes['hourly-pay-id'] = response.data[0].id;
                deferd.resolve(that.rates);
            });
            return deferd.promise;
        };

        $scope.getRate();

        this.save = function () {
            jobService.companyCreate(that.model);
        };
        //How to config job company?*/
    }])
    .controller('CompanyApproveJobCtrl', ['jobService', '$scope', 'justFlowService', 'justRoutes', '$q', function (jobService, $scope, flow, routes, $q) {
        var that = this;
        /*
        if (!flow.next_data) {
            flow.next(routes.company.register.url);
            return;
        }

        //this.model = jobService.jobModel;
        this.model = flow.next_data;
        $scope.job = flow.next_data.data;

        this.rates = {};
        $scope.setRate = function () {
            that.rates = jobService.rates();
            var deferd = $q.defer();
            that.rates.$promise.then(function (response) {
                that.rates = response.data;
                angular.forEach(that.rates, function (obj, key) {
                    if(obj.id === $scope.job.attributes["hourly-pay-id"]){
                        $scope.job.max_rate = obj.attributes.rate;
                        $scope.job.totalRate = $scope.job.attributes.hours * $scope.job.max_rate;
                        $scope.job.currency = obj.attributes.currency;
                    }
                });
                deferd.resolve(that.rates);
            });
            return deferd.promise;
        };

        $scope.setRate();

        this.approve = function () {
            jobService.companyApprove(that.model);
        };
        this.edit = function () {
            jobService.companyEdit(that.model);
        };*/
    }]);

