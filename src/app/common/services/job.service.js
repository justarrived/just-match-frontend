/**
 * @ngdoc service
 * @name just.service.service:jobService
 * @description
 * # jobService
 * Service to handle jobs.
 */
angular.module('just.service')
  .service('jobService', ['$q', 'justFlowService', 'authService',
  'Resources', 'justRoutes','i18nService', '$timeout', function ($q, flow, authService, Resources, routes, i18nService, $timeout) {
    var that = this;
    this.rates = function () {
      var rates = [
        {value: 80, name: 'assignment.new.rate.low'},
        {value: 100, name: 'assignment.new.rate.medium'},
        {value: 120, name: 'assignment.new.rate.high'},
      ];
      return rates;
    };
    this.jobModel = {data: {
      attributes: {"language_id": i18nService.getLanguage().id, "max_rate": "80"}
    }};
    this.jobMessage = {};
    this.getJob = function (id) {
      return Resources.job.get({id: id});
    };
    this.getJobs = function () {
      return Resources.jobs.get();
    };
    this.approve = function (job) {
      Resources.jobs.create(job, function (data) {
        flow.next(routes.job.approved.url, data);
      }, function (error) {
        that.jobMessage = error;
        flow.reload(routes.job.create.url);
      });
    };
    this.edit = function (job) {
      flow.next(routes.job.create.url, job);
    };

    this.create = function (job) {
      that.jobModel = job;
      if (authService.isAuthenticated()) {
        flow.next(routes.job.approve.url);
      } else {
        flow.redirect(routes.user.select.url, function () {
          that.create(job);
        });
      }
    };
  }]);
