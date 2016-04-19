(function (window, angular, _, undefined) {
    'use strict';

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
        .controller('ListJobCtrl', ['datastoreService', 'jobService', '$scope', function (datastoreService, jobService, $scope) {
            var that = this;

            this.model = jobService.getJobs();

            $scope.map = {zoom: 8};

            $scope.markers = [];

            var i = 0;
            datastoreService.fetch('jobs')
                .then(function (data) {
                    var jobs = data.store.graph.jobs;
                    $scope.jobs = jobs;
                    angular.forEach($scope.jobs, function (value, key) {
                        if (value["zip-latitude"] !== null && value["zip-longitude"] !== null) {
                            $scope.markers.push({
                                idkey: i,
                                coords: {
                                    latitude: value["zip-latitude"],
                                    longitude: value["zip-longitude"]
                                }
                            });
                            if (i === 0) {
                                $scope.map.center = {
                                    latitude: value["zip-latitude"],
                                    longitude: value["zip-longitude"]
                                };
                            }
                            i++;
                        }
                    });
                });

        }])
        .controller('ViewJobCtrl', ['datastoreService', '$scope', '$routeParams',
            function (datastoreService, $scope, $routeParams) {

                datastoreService.fetch('jobs/' + $routeParams.id + '.json?include=owner,company')
                    .then(function (data) {
                        var job = data.store.find('jobs', $routeParams.id);
                        job.totalRate = job.hours * job.max_rate;

                        $scope.job = job;
                    });
            }]);

}(window, window.angular, _));
