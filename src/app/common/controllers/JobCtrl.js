(function(window, angular, _, undefined) {
  'use strict';

  angular.module('just.common').controller('JobCtrl', ['jobService',
    function (jobService) {
      var that = this;

      this.model = jobService.jobModel;
      this.message = jobService.jobMessage;
      this.model.data.attributes.hours = 1;

      this.create = function () {
        jobService.create(that.model);
      };

      this.addHour = function () {
        that.model.data.attributes.hours += 1;
      };
    }])
  .controller('ApproveJobCtrl', ['jobService', '$routeParams',
    function (jobService, $routeParams) {
      var that = this;

      this.model = jobService.getJob($routeParams.id);

      this.approve = function () {
        jobService.approve(that.model);
      };

    }])
  .controller('ListJobCtrl', ['jobService',
    function (jobService) {
      var that = this;

      this.model = jobService.getJobs();

    }])
  .controller('ViewJobCtrl', ['datastoreService', '$scope','$routeParams',
    function (datastoreService, $scope, $routeParams) {

      datastoreService.fetch('jobs/' + $routeParams.id + '.json?include=owner,company')
        .then(function (data) {
          var job = data.store.find('jobs', $routeParams.id);
          job.totalRate = job.hours * job.max_rate;

          $scope.job = job;
        });
    }]);

}(window, window.angular, _));
