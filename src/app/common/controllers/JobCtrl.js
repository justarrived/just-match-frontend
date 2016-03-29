angular
  .module('just.common')
  .controller('CreateJobCtrl', ['jobService', 'i18nService', function (jobService) {
    var that = this;
    this.text = {
      title: 'assignment.new.title',
      submit: 'assignment.new.form.next'
    };

    this.model = jobService.jobModel;
    this.message = jobService.jobMessage;
    this.model.data.attributes.hours = 1;
    this.rates = jobService.rates();
    this.save = function () {
      jobService.create(that.model);
    };
  }])
  .controller('EditJobCtrl', ['jobService', '$routeParams', function (jobService, $routeParams) {
    var that = this;
    this.text = {
      title: 'assignment.update.title',
      submit: 'assignment.update.form.next'
    };

    this.model = jobService.getJob($routeParams.id);

    this.rates = jobService.rates();

    this.save = function () {
      jobService.update(that.model);
    };

    this.cancel = function () {

    };
  }])
  .controller('ApproveJobCtrl', ['jobService', function (jobService) {
    var that = this;

    this.model = jobService.jobModel;

    this.approve = function () {
      jobService.approve(that.model);
    };
    this.edit = function () {
      jobService.edit(that.model);
    };
  }])
  .controller('ListJobCtrl', ['jobService',  function (jobService) {
    var that = this;

    this.model = jobService.getJobs();

  }])
  .controller('ViewJobCtrl', ['jobService', '$routeParams', function (jobService, $routeParams) {
    var that = this;

    jobService.getJob($routeParams.id)
      .$promise.then(function(job) {
        var jobAttributes = job.data.attributes;

        that.totalRate = jobAttributes.hours * jobAttributes.max_rate;
        that.model = jobAttributes;
      });
  }]);