angular
  .module('just.common')
  .controller('JobCtrl', ['jobService', function (jobService) {
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
  .controller('ApproveJobCtrl', ['jobService', '$routeParams', function (jobService, $routeParams) {
    var that = this;

    this.model = jobService.getJob($routeParams.id);

    this.approve = function () {
      jobService.approve(that.model);
    };

  }])
  .controller('ListJobCtrl', ['jobService',  function (jobService) {
    var that = this;

    this.model = jobService.getJobs();

  }])
  .controller('ViewJobCtrl', ['jobService', '$routeParams', function (jobService, $routeParams) {
    var that = this;

    this.model = jobService.getJob($routeParams.id);

  }]);


