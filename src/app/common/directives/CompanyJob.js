angular
    .module('just.common')
    .directive('companyJobPerform', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/company-job-perform.html'
        };
    });