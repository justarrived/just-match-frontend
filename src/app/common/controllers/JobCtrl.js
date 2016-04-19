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
        .controller('ListJobCtrl', ['datastoreService', 'jobService', '$scope', '$location', 'settings', 'Resources', function (datastoreService, jobService, $scope, $location, settings, Resources) {
            var that = this;

            $scope.categories = Resources.categories.get();
            $scope.categoryFilter = function () {
                //console.log($scope.categorySelected);
                //Need more api get jobs by category
            };

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

            $scope.getJobsPage = function (mode) {
                var url;
                var isNav = 0;
                var i = 0;
                $scope.markers = [];
                if (['first', 'prev', 'next', 'last'].indexOf(mode) > -1) {
                    url = $scope.jobs.links[mode];
                    isNav = 1;
                } else {
                    url = mode;
                }
                url = decodeURIComponent(url);
                url = url.replace(settings.just_match_api + '/api/v1/jobs?include=', '');
                if (isNav === 1) {
                    var param = url.split('&');
                    var paramVal = [];
                    for (i = 0; i < param.length; i++) {
                        var val = param[i].split('=');
                        paramVal.push(val[1]);
                    }
                    $scope.jobs = jobService.getJobsPage(paramVal[0], paramVal[1], paramVal[2]);
                } else {
                    $scope.jobs = jobService.getJobs(url);
                }

                $scope.jobs.$promise.then(function (result) {
                    i = 0;

                    angular.forEach(result.data, function (obj, key) {
                        var value = obj.attributes;
                        if (value["zip-latitude"] !== null && value["zip-longitude"] !== null) {
                            $scope.markers.push({
                                id: obj.id,
                                coords: {
                                    latitude: value["zip-latitude"],
                                    longitude: value["zip-longitude"]
                                },
                                options: {
                                    icon: "/assets/images/ui/logo-pin.png"
                                },
                                job: obj
                            });
                            if (i === 0) {
                                $scope.map.center = {
                                    latitude: value["zip-latitude"],
                                    longitude: value["zip-longitude"]
                                };
                            }
                            i++;
                        }

                        angular.forEach(result.included, function (obj2, key2) {
                            if (obj2.type === 'hourly-pays' && obj2.id === obj.relationships["hourly-pay"].data.id) {
                                $scope.jobs.data[key].max_rate = obj2.attributes.rate;
                                $scope.jobs.data[key].totalRate = value.hours * $scope.jobs.data[key].max_rate;
                                $scope.jobs.data[key].currency = obj2.attributes.currency;
                            }
                        });
                    });
                });

            };

            $scope.getJobsPage('owner,company,hourly-pay');


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
