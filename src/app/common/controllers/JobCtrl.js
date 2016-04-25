(function (window, angular, _, undefined) {
    'use strict';

    angular
        .module('just.common')
        .controller('CreateJobCtrl', ['jobService', 'i18nService', '$scope', '$q', 'Resources', function (jobService, i18nService, $scope, $q, Resources) {
            var that = this;
            this.text = {
                title: 'assignment.new.title',
                submit: 'assignment.new.form.next'
            };

            this.model = jobService.jobModel;
            this.message = jobService.jobMessage;
            this.model.data.attributes.hours = 2;

            this.rates = {};
            $scope.getRate = function (hp_id) {
                that.rates = jobService.rates();
                var deferd = $q.defer();
                that.rates.$promise.then(function (response) {
                    that.rates = response;
                    that.model.data.attributes['hourly-pay-id'] = ((!hp_id) ? response.data[0].id : hp_id );
                    deferd.resolve(that.rates);
                });
                return deferd.promise;
            };

            $scope.getRate(this.model.data.attributes['hourly-pay-id']);

            $scope.categoryOptions = {
                async: true,
                onSelect: function (item) {
                    that.model.data.attributes['category-id'] = item.id;
                    that.model.data.attributes.category_name = item.name;
                }
            };

            $scope.searchAsync = function (term) {
                // No search term: return initial items
                if (!term) {
                    term = '';
                }

                var deferd = $q.defer();
                $scope.categories = Resources.categories.get({
                    'page[number]': 1,
                    'page[size]': 100,
                    'filter[name]': term
                });

                $scope.categories.$promise.then(function (response) {
                    $scope.categories = response;
                    var result = [];
                    angular.forEach(response.data, function (obj, key) {
                        result.push({
                            id: obj.id,
                            name: obj.attributes.name
                        });
                    });
                    deferd.resolve(result);
                });
                return deferd.promise;
            };

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
        .controller('ApproveJobCtrl', ['jobService', '$scope', '$q', function (jobService, $scope, $q) {
            var that = this;

            this.model = jobService.jobModel;
            $scope.job = jobService.jobModel.data;

            this.rates = {};
            $scope.setRate = function () {
                that.rates = jobService.rates();
                var deferd = $q.defer();
                that.rates.$promise.then(function (response) {
                    that.rates = response.data;
                    angular.forEach(that.rates, function (obj, key) {
                        if (obj.id === $scope.job.attributes["hourly-pay-id"]) {
                            $scope.job.max_rate = obj.attributes.rate;
                            $scope.job.totalRate = $scope.job.attributes.hours * $scope.job.max_rate;
                            $scope.job.currency = obj.attributes.currency;
                        }
                    });
                    deferd.resolve(that.rates);
                });
                return deferd.promise;
            };

            $scope.setRate();

            this.approve = function () {
                jobService.approve(that.model);
            };
            this.edit = function () {
                jobService.edit(that.model);
            };
        }])
        .controller('ListJobCtrl', ['jobService', '$scope', 'settings', 'Resources', '$q', function (jobService, $scope, settings, Resources, $q) {
            var that = this;

            $scope.categoryOptions = {
                async: true,
                onSelect: function (item) {
                    console.log(item);
                }
            };

            $scope.searchAsync = function (term) {
                // No search term: return initial items
                if (!term) {
                    term = '';
                }

                var deferd = $q.defer();
                $scope.categories = Resources.categories.get({
                    'page[number]': 1,
                    'page[size]': 100,
                    'filter[name]': term
                });

                $scope.categories.$promise.then(function (response) {
                    $scope.categories = response;
                    var result = [];
                    angular.forEach(response.data, function (obj, key) {
                        result.push({
                            id: obj.id,
                            name: obj.attributes.name
                        });
                    });
                    deferd.resolve(result);
                });
                return deferd.promise;
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
                url = url.replace(settings.just_match_api + settings.just_match_api_version + 'jobs?', '');

                if (isNav === 1) {
                    var param = url.split('&');
                    var paramVal = {};
                    for (i = 0; i < param.length; i++) {
                        var val = param[i].split('=');
                        paramVal[val[0]] = val[1];
                    }
                    $scope.jobs = jobService.getJobsPage(paramVal);
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
        .controller('ViewJobCtrl', ['datastoreService', 'commentService', 'jobService', '$scope', '$routeParams',
            function (datastoreService, commentService, jobService, $scope, $routeParams) {

                $scope.job = jobService.getJob($routeParams.id);
                $scope.job.$promise.then(function (result) {
                    $scope.job = result.data;
                    $scope.job.owner = result.included[0];
                    $scope.job.company = result.included[1];
                    $scope.job.max_rate = result.included[2].attributes.rate;
                    $scope.job.totalRate = $scope.job.attributes.hours * $scope.job.max_rate;
                    $scope.job.currency = result.included[2].attributes.currency;
                });

                $scope.comments = commentService.getComments('jobs', $routeParams.id, 'owner');
                $scope.comments_quantity = 5;

                $scope.jobs_more = jobService.getJobs();
                $scope.jobs_more_quantity = 5;

            }]);

}(window, window.angular, _));
