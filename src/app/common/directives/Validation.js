angular
    .module('just.common')
    .directive('validation', function() {
        return {
            restrict: 'E',
            scope: {
                field: '@',
                errormsg: '@',
                form: '='
            },
            templateUrl: 'common/templates/directives/validation.html',
            transclude: true
        };
    })
    .directive('validation2', function() {
    return {
        restrict: 'E',
        scope: {
            field: '@',
            errormsg: '@',
            form: '='
        },
        templateUrl: 'common/templates/directives/validation2.html',
        transclude: true
    };
});
