angular
    .module('just.common')
    .directive('companyJobPerform', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/company-job-perform.html'
        };
    })
    .directive('companyJobChat', function () {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'common/templates/company-job-candidate-chat.html',
            controller:'CompanyJobsCandidateChatCtrl',
            controllerAs:'cCtrl'
        };
    });