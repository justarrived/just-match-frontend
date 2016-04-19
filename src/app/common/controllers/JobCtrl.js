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
        .controller('ListJobCtrl', ['datastoreService', 'jobService', '$scope', '$location', function (datastoreService, jobService, $scope, $location) {
            var that = this;

            $scope.map_class = "";
            $scope.zoom_class = "map-zoom-in";

            $scope.map = {
                zoom: 7,
                options: {
                    draggable: true,
                    disableDefaultUI: true,
                    panControl: false,
                    navigationControl: false,
                    scrollwheel: false,
                    scaleControl: false
                }
            };

            $scope.zoomInOut = function () {
                if ($scope.map_class === '') {
                    $scope.map_class = "full-screen";
                } else {
                    $scope.map_class = "";
                }

                if ($scope.zoom_class === 'map-zoom-in') {
                    $scope.zoom_class = "map-zoom-in map-zoom-out";
                } else {
                    $scope.zoom_class = "map-zoom-in";
                }

                window.google.maps.event.trigger($scope.map, 'resize');
            };

            $scope.markers = [];

            var i = 0;
            datastoreService.fetch('jobs?include=owner,company,hourly-pay')
                .then(function (data) {
                    var jobs = data.store.graph.jobs;
                    $scope.jobs = jobs;
                    angular.forEach($scope.jobs, function (value, key) {
                        $scope.jobs[key].max_rate = value["hourly-pay"].rate;
                        $scope.jobs[key].totalRate = value.hours * value["hourly-pay"].rate;
                        if (value["zip-latitude"] !== null && value["zip-longitude"] !== null) {
                            $scope.markers.push({
                                id: value.id,
                                coords: {
                                    latitude: value["zip-latitude"],
                                    longitude: value["zip-longitude"]
                                },
                                options: {
                                    icon: "/assets/images/ui/logo-pin.png"
                                },
                                job: value
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
