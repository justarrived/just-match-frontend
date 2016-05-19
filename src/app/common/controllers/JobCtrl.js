(function (window, angular, _, undefined) {
    'use strict';

    angular
        .module('just.common')
        .controller('CreateJobCtrl', ['jobService', 'authService', 'i18nService', 'justFlowService', 'justRoutes', 'userService', '$scope', '$q', 'Resources',
            function (jobService, authService, i18nService, flow, routes, userService, $scope, $q, Resources) {
                var that = this;
                this.text = {
                    title: 'assignment.create.title',
                    submit: 'common.next_step'
                };

                userService.checkCompanyUser('Arriver user cannot create a job', 'Back to home', routes.global.start.url, routes.job.create.url);

                this.model = jobService.jobModel;
                this.message = jobService.jobMessage;
                this.model.data.attributes.hours = 2;


                $scope.$watch('form', function(form) {
                    if(form) {
                        if (that.message.data) {
                            angular.forEach(that.message.data.errors, function (obj, key) {
                                var pointer_arr = obj.source.pointer.split("/");
                                var field_name = pointer_arr[pointer_arr.length - 1];

                                field_name = field_name.replace(/-/g, "_");

                                switch(field_name){
                                    case 'job_date': field_name = 'from_date'; break;
                                    case 'job_end_date': field_name = 'to_date'; break;
                                }
                                $scope.form[field_name].error_detail = obj.detail;
                            });

                        }
                    }
                });

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
                    that.model.data.attributes["language-id"] = i18nService.current_language.id;
                    jobService.create(that.model);
                };
            }])
        .controller('EditJobCtrl', ['jobService', '$routeParams', function (jobService, $routeParams) {
            var that = this;
            this.text = {
                title: 'assignment.update.title',
                submit: 'common.next_step'
            };

            this.model = jobService.getJob($routeParams.id);

            this.rates = jobService.rates();

            this.save = function () {
                jobService.update(that.model);
            };

            this.cancel = function () {

            };
        }])
        .controller('ApproveJobCtrl', ['jobService', 'userService', 'justRoutes', '$scope', '$q', function (jobService, userService, routes, $scope, $q) {
            var that = this;

            userService.checkCompanyUser('Arriver user cannot create a job', 'Back to home', routes.global.start.url);

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
        .controller('ListJobCtrl', ['jobService', '$scope', 'settings', 'Resources', '$q', '$filter', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
            function (jobService, $scope, settings, Resources, $q, $filter, uiGmapGoogleMapApi, uiGmapIsReady) {
                var that = this;

                this.changePage = 0;

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

                uiGmapGoogleMapApi.then(function (maps) {
                    maps.visualRefresh = true;
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
                });

                uiGmapIsReady.promise(1).then(function (instances) {
                    instances.forEach(function (inst) {
                        $scope.mapObj = inst.map;
                        $scope.uuid = $scope.mapObj.uiGmap_id;
                        var mapInstanceNumber = inst.instance; // Starts at 1.
                    });
                });


                $scope.zoomInOut = function () {
                    if ($scope.map_class === '') {
                        $scope.zoomOutHeight = angular.element("#map_canvas").height() + "px";
                        $scope.zoomOutWidth = angular.element("#map_canvas").width() + "px";
                        $scope.map_class = "full-screen";
                        angular.element(".angular-google-map-container").css("height", window.innerHeight + "px");
                        angular.element(".angular-google-map-container").css("width", window.innerWidth + "px");
                        google.maps.event.trigger($scope.mapObj, 'resize');
                        //$scope.mapObj.setCenter(new google.maps.LatLng($scope.bounds.getCenter().lat(), $scope.bounds.getCenter().lng()));
                        $scope.mapObj.fitBounds($scope.bounds);
                    } else {
                        $scope.map_class = "";
                        angular.element(".angular-google-map-container").css("height", $scope.zoomOutHeight);
                        angular.element(".angular-google-map-container").css("width", $scope.zoomOutWidth);
                        google.maps.event.trigger($scope.mapObj, 'resize');
                        //$scope.mapObj.setCenter(new google.maps.LatLng($scope.bounds.getCenter().lat(), $scope.bounds.getCenter().lng()));
                        $scope.mapObj.fitBounds($scope.bounds);
                    }

                    if ($scope.zoom_class === 'map-zoom-in') {
                        $scope.zoom_class = "map-zoom-in map-zoom-out";
                    } else {
                        $scope.zoom_class = "map-zoom-in";
                    }


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

                        if(that.changePage === 1){
                            that.changePage = 0;
                            $("html, body").delay(300).animate({scrollTop: $('#job-more-list').offset().top }, 500);
                        }

                        angular.forEach(result.data, function (obj, idx) {
                            $scope.jobs.data[idx].company_image = "assets/images/content/placeholder-logo.png";
                        });

                        angular.forEach(result.data, function (obj, key) {

                            var found = $filter('filter')(result.included, {id: "" + obj.relationships.company.data.id}, true);
                            if (found.length > 0) {
                                if (found[0].relationships["company-images"].data.length > 0) {
                                    Resources.companyImage.get({
                                        company_id: found[0].id,
                                        id: found[0].relationships["company-images"].data[0].id
                                    }, function (result0) {
                                        $scope.jobs.data[key].company_image = result0.data.attributes["image-url-small"];
                                    });
                                }
                            }

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

                        $scope.bounds = new google.maps.LatLngBounds();
                        angular.forEach($scope.markers, function (value, key) {
                            var myLatLng = new google.maps.LatLng($scope.markers[key].coords.latitude, $scope.markers[key].coords.longitude);
                            $scope.bounds.extend(myLatLng);
                        });
                        $scope.map = {
                            center: {
                                latitude: $scope.bounds.getCenter().lat(),
                                longitude: $scope.bounds.getCenter().lng()
                            }, zoom: 4
                        };

                    });

                };

                $scope.getJobsPage('owner,company,hourly-pay');


            }])
        .controller('ViewJobCtrl', ['authService', 'userService', 'i18nService', 'commentService', 'jobService', '$scope', '$routeParams', 'settings',
            'justFlowService', 'justRoutes', 'Resources', '$q', '$filter', '$location', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
            function (authService, userService, i18nService, commentService, jobService, $scope, $routeParams, settings, flow, routes, Resources, $q, $filter, $location, uiGmapGoogleMapApi, uiGmapIsReady) {
                var that = this;

                this.canApplyJob = 0;
                this.commentForm = commentService.getModel('jobs', $routeParams.id);
                this.changePage = 0;

                $scope.map_class = "";
                $scope.zoom_class = "map-zoom-in";

                uiGmapGoogleMapApi.then(function (maps) {
                    maps.visualRefresh = true;
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
                });

                uiGmapIsReady.promise(1).then(function (instances) {
                    instances.forEach(function (inst) {
                        $scope.mapObj = inst.map;
                        $scope.uuid = $scope.mapObj.uiGmap_id;
                        var mapInstanceNumber = inst.instance; // Starts at 1.
                    });
                });

                this.signedIn = function () {
                    return authService.isAuthenticated();
                };

                this.accept_job = function () {
                    //flow.next(routes.user.user.url, $routeParams.id);
                    var path = $location.path();
                    var job_id = $routeParams.id;
                    if (authService.isAuthenticated()) {
                        jobService.acceptJob($routeParams.id);
                    } else {
                        userService.apply_job_id = $routeParams.id;
                        flow.redirect(routes.user.select.url, function () {
                            //flow.redirect(path);
                            if (userService.isCompany === 0) {
                                jobService.acceptJob(job_id);
                            }else{
                                flow.redirect(routes.job.get.resolve({id: job_id}));
                            }
                        });
                    }
                };

                if(authService.isAuthenticated()){
                    that.userModel = userService.userModel();
                    if(that.userModel.$promise){
                        that.userModel.$promise.then(function(result){
                            that.isCompany = userService.isCompany;
                        });
                    }else{
                        that.isCompany = userService.isCompany;
                    }
                }



                $scope.isSignIn = this.signedIn();

                $scope.company_image = "assets/images/content/placeholder-logo.png";

                if (authService.isAuthenticated()) {
                    $scope.job_user = jobService.getUserJobs({
                        user_id: authService.userId().id,
                        'filter[job-id]': $routeParams.id
                    });
                    $scope.job_user.$promise.then(function (response) {
                        if (response.data.length > 0) {
                            that.canApplyJob = 0;
                        } else {
                            that.canApplyJob = 1;
                        }
                    });
                } else {
                    that.canApplyJob = 1;
                }


                Resources.job.get({
                    id: $routeParams.id,
                    "include": "owner,company,hourly-pay,job-users"
                }, function (result) {
                    $scope.job = result.data;
                    $scope.job.owner = result.included[0];
                    $scope.job.company = result.included[1];
                    $scope.job.max_rate = result.included[2].attributes.rate;
                    $scope.job.totalRate = $scope.job.attributes.hours * $scope.job.max_rate;
                    $scope.job.currency = result.included[2].attributes.currency;
                    var company_image_arr = result.included[1].relationships["company-images"].data;
                    if (company_image_arr.length > 0) {
                        Resources.companyImage.get({
                            company_id: result.data.relationships.company.data.id,
                            id: company_image_arr[0].id
                        }, function (resultImage) {
                            $scope.company_image = resultImage.data.attributes["image-url-small"];
                        });

                    }


                    if (authService.isAuthenticated()) {
                        var found_job_users = $filter('filter')(result.included, {
                            type: 'job-users',
                            relationships: {user: {data: {id: authService.userId().id}}}
                        }, true);
                    }

                });

                this.getComments = function (job_id) {
                    $scope.comments = commentService.getComments('jobs', job_id, 'owner,owner.user-images');
                    $scope.comments.$promise.then(function (response) {
                        var deferd = $q.defer();
                        $scope.comments = [];
                        var curr_user_id = '0';
                        angular.forEach(response.data, function (obj, key) {
                            var found = $filter('filter')(response.included, {
                                id: "" + obj.relationships.owner.data.id,
                                type: "users"
                            }, true);
                            if (found.length > 0) {
                                obj.attributes["first-name"] = found[0].attributes["first-name"];
                                obj.attributes["last-name"] = found[0].attributes["last-name"];
                            }
                            if (authService.isAuthenticated()) {
                                if (authService.userId().id === obj.relationships.owner.data.id) {
                                    obj.attributes.isOwner = 1;
                                } else {
                                    obj.attributes.isOwner = 0;
                                }
                            } else {
                                obj.attributes.isOwner = 0;
                            }

                            obj.user_image = "assets/images/content/placeholder-profile-image.png";

                            if (found[0].relationships["user-images"].data.length > 0) {
                                var found_image = $filter('filter')(response.included, {
                                    id: "" + found[0].relationships["user-images"].data[0].id,
                                    type: "user-images"
                                }, true);
                                if(found_image.length > 0){
                                    obj.user_image = found_image[0].attributes["image-url-small"];
                                }
                            }



                            $scope.comments.push(obj);
                        });
                        deferd.resolve($scope.comments);
                        return deferd.promise;
                    });
                };

                this.getComments($routeParams.id);

                this.submitComment = function () {
                    that.commentForm.data.attributes["language-id"] = parseInt(i18nService.getLanguage().$$state.value.id);
                    var formData = {};
                    angular.copy(that.commentForm, formData);
                    that.commentForm.data.attributes.body = "";
                    Resources.comments.create({
                        resource_name: "jobs",
                        resource_id: $routeParams.id
                    }, formData, function (response) {
                        that.getComments($routeParams.id);
                    });
                };

                $scope.getJobsPage = function (mode) {
                    var url;
                    var isNav = 0;
                    var i = 0;
                    $scope.markers = [];
                    if (['first', 'prev', 'next', 'last'].indexOf(mode) > -1) {
                        url = $scope.jobs_more.links[mode];
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
                        $scope.jobs_more = jobService.getJobsPage(paramVal);
                    } else {
                        $scope.jobs_more = jobService.getJobs(url);
                    }

                    $scope.jobs_more.$promise.then(function (result) {
                        i = 0;

                        if(that.changePage === 1){
                            that.changePage = 0;
                            $("html, body").delay(300).animate({scrollTop: $('#job-more-list').offset().top }, 500);
                        }


                        angular.forEach(result.data, function (obj, idx) {
                            $scope.jobs_more.data[idx].company_image = "assets/images/content/placeholder-logo.png";
                        });

                        angular.forEach(result.data, function (obj, key) {
                            var found = $filter('filter')(result.included, {id: "" + obj.relationships.company.data.id}, true);
                            if (found.length > 0) {
                                if (found[0].relationships["company-images"].data.length > 0) {
                                    Resources.companyImage.get({
                                        company_id: found[0].id,
                                        id: found[0].relationships["company-images"].data[0].id
                                    }, function (result0) {
                                        $scope.jobs_more.data[key].company_image = result0.data.attributes["image-url-small"];
                                    });
                                }
                            }

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
                                    $scope.jobs_more.data[key].max_rate = obj2.attributes.rate;
                                    $scope.jobs_more.data[key].totalRate = value.hours * $scope.jobs_more.data[key].max_rate;
                                    $scope.jobs_more.data[key].currency = obj2.attributes.currency;
                                }
                            });
                        });

                        $scope.bounds = new google.maps.LatLngBounds();
                        angular.forEach($scope.markers, function (value, key) {
                            var myLatLng = new google.maps.LatLng($scope.markers[key].coords.latitude, $scope.markers[key].coords.longitude);
                            $scope.bounds.extend(myLatLng);
                        });
                        $scope.map = {
                            center: {
                                latitude: $scope.bounds.getCenter().lat(),
                                longitude: $scope.bounds.getCenter().lng()
                            }, zoom: 4
                        };
                    });
                };

                $scope.getJobsPage('owner,company,hourly-pay');

            }])
        .controller('AcceptedJobCtrl', ['justFlowService', 'justRoutes', function (flow, routes) {

            this.gotoJobDetail = function () {
                if (flow.next_data) {
                    flow.redirect(routes.job.get.resolve({id: flow.next_data}));
                } else {
                    flow.redirect(routes.job.list.url);
                }
            };

            this.gotoJobList = function () {
                flow.redirect(routes.job.list.url);
            };
        }]);

}(window, window.angular, _));
