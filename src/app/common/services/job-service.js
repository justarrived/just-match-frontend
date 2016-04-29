/**
 * @ngdoc service
 * @name just.service.service:jobService
 * @description
 * # jobService
 * Service to handle jobs.
 */
angular.module('just.service')
    .service('jobService', ['$q', 'justFlowService', 'authService', 'Resources', 'justRoutes', 'i18nService', '$http', 'settings',
        function ($q, flow, authService, Resources, routes, i18nService, $http, settings) {
            var that = this;
            this.rates = function () {
                /*var rates = [
                 {value: 80, name: 'assignment.new.rate.low'},
                 {value: 100, name: 'assignment.new.rate.medium'},
                 {value: 120, name: 'assignment.new.rate.high'},
                 ];
                 return rates;*/
                return Resources.hourly_pays.get({'sort': 'rate', 'page[number]': 1, 'page[size]': 100});
            };
            this.jobModel = {
                data: {
                    attributes: {"language-id": i18nService.current_language.id, "max_rate": "80"}
                }
            };
            this.jobMessage = {};
            this.getJob = function (id) {
                return Resources.job.get({id: id, "include": "owner,company,hourly-pay"});
            };
            this.getJobs = function () {
                return Resources.jobs.get();
            };
            this.getJobs = function (include) {
                return Resources.jobs.get({'include': include});
            };
            this.getJobsPage = function (paramObj) {
                return Resources.jobs.get(paramObj);
            };
            this.getUserJobs = function (user_id, include) {
                return Resources.userJobs.get({user_id: user_id, 'include': include});
            };
            this.getJobUsers = function (job_id, include) {
                return Resources.jobUsers.get({job_id: job_id, 'include': include});
            };
            this.getJobUser = function (job_id, user_id, include) {
                return Resources.jobUser.get({job_id: job_id, id: user_id, 'include': include});
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
            this.acceptJob = function (job_id) {
                /*Resources.jobUsers.create({job_id: job_id}, function (data) {
                 flow.next(routes.job.accept.url, job_id);
                 }, function (error) {
                 that.jobMessage = error;
                 flow.reload(routes.user.user.url);
                 });*/

                $http.post(settings.just_match_api + settings.just_match_api_version + "jobs/" + job_id + "/users").success(function (data, status) {
                    flow.next(routes.job.accept.url, job_id);
                }).error(function (data, status) {
                    that.jobMessage = data;
                    flow.reload(routes.user.user.url);
                });
            };
        }]);
