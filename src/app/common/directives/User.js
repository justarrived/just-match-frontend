angular
    .module('just.common')
    .directive('userHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-header.html'
        };
    });