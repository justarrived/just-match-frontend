angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:CompanyCtrl
     *
     */
    .controller('RegisterCompanyCtrl', ['companyService', 'Resources', function (companyService) {
        var that = this;
        this.data = companyService.signinModel;
        this.message = companyService.signinMessage;
        this.process = function () {
            companyService.register(that.data);
        };
    }]);
