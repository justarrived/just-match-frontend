angular
    .module('just.common')
    .directive('userHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-header.html'
        };
    })
    .directive('userJobPerform', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-job-perform.html'
        };
    });