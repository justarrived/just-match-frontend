angular
  .module('just.common')
  .directive('jobHeader', function() {
    return {
      restrict: 'E',
      // scope: { model: '=model' },
      templateUrl: 'common/templates/job-header.html'
    };
  })
  .directive('jobBody', function() {
    return {
      restrict: 'E',
      // scope: { model: '=model' },
      templateUrl: 'common/templates/job-body.html'
    };
  });