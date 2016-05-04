angular.module('just.common')
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$q', '$filter', 'jobService', 'settings', 'httpPostFactory',
        function (userService, $scope, Resources, authService, flow, routes, $q, $filter, jobService, settings, httpPostFactory) {
            var that = this;

            this.isStart = 1;

            if (!authService.isAuthenticated()) {
                flow.redirect(routes.user.select.url, function () {
                    flow.redirect(routes.user.user.url);
                });
            }

            this.model = {};
            this.model.data = {};
            this.model.data.attributes = {};

            this.model = userService.userModel();
            this.message = userService.userMessage;

            this.user_image = 'assets/images/content/hero.png';


            this.model.$promise.then(function (response) {
                var deferd = $q.defer();

                that.language_bundle = [];
                var found = $filter('filter')(response.included, {
                    id: "" + response.data.attributes["language-id"],
                    type: "languages"
                }, true);
                if (found.length > 0) {
                    that.language_bundle.push(found[0]);
                    that.model.data.attributes['language-id'] = '' + that.model.data.attributes['language-id'];
                }

                var found_img = $filter('filter')(response.included, {
                    type: 'user-images'
                }, true);
                if (found_img.length > 0) {
                    that.user_image = found_img[0].attributes["image-url-small"];
                }

                deferd.resolve(that.language_bundle);
                deferd.resolve(that.user_image);
                return deferd.promise;
            });


            $scope.languagesArr = [];

            $scope.languagesArrFn = function (query, querySelectAs) {
                var deferd = $q.defer();

                $scope.languages = Resources.languages.get({
                    'page[number]': 1,
                    'page[size]': 50,
                    'sort': 'en-name',
                    'filter[name]': query
                });

                $scope.languages.$promise.then(function (response) {
                    $scope.languagesArr = response;
                    var result = [];
                    angular.forEach(response.data, function (obj, key) {
                        result.push(obj);
                    });
                    deferd.resolve(result);
                });
                return deferd.promise;
            };

            $scope.uploadFile = function () {
                var formData = new FormData();

                var element = angular.element("#file_upload");

                formData.append("image", element[0].files[0]);
                httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'users/images', formData, function (callback) {
                    var image_token = {};
                    image_token.data = {};
                    image_token.data.attributes = {};
                    image_token.data.attributes["user-image-one-time-token"] = callback.data.attributes["one-time-token"];
                    Resources.user.save({id: that.model.data.id}, image_token, function (response) {
                        //console.log(response);
                    });
                });
            };

            /*Image upload and submit*/
            this.image = {};

            this.save = function () {
                var update_data = {};
                update_data.data = {};
                update_data.data.attributes = {};
                update_data.data.attributes.description = that.model.data.attributes.description;
                update_data.data.attributes["job-experience"] = that.model.data.attributes["job-experience"];
                update_data.data.attributes.education = that.model.data.attributes.education;
                //update_data.data.attributes["language-id"] = that.model.data.attributes["language-id"];

                //save data

                // UPLOAD IMAGE
                var element = angular.element("#file_upload");
                if (element[0].files[0]) {
                    $scope.uploadFile();
                }

                // UPDATE USER PROFILE
                Resources.user.save({id: that.model.data.id}, update_data, function (response) {
                    //console.log(response);
                });


                // UPDATE USER LANGUAGE SKILL

                if (flow.next_data) {
                    var job_id = flow.next_data;
                    jobService.acceptJob(job_id);
                }

            };
        }]);


