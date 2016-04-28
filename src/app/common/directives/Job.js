angular
    .module('just.common')
    .directive('jobHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/job-header.html'
        };
    })
    .directive('jobBody', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/job-body.html'
        };
    })
    .directive('jobComment', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/job-comment.html'
        };
    })
    .directive('jobMore', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/job-more.html'
        };
    })
    .directive('userJobHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-job-header.html'
        };
    });