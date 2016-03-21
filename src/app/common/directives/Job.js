angular
  .module('just.common')
  .directive('jobHeader', function() {
    return {
      restrict: 'E',
      templateUrl: 'common/templates/job-header.html'
    };
  })
  .directive('jobBody', function() {
    return {
      restrict: 'E',
      templateUrl: 'common/templates/job-body.html'
    };
  });