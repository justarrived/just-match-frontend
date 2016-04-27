angular.module('just.common')
    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        };
    }])
    .controller('UserCtrl', ['userService', '$scope', 'Resources', 'authService', 'justFlowService', 'justRoutes', '$q',
        function (userService, $scope, Resources, authService, flow, routes, $q) {
            var that = this;

            if (!authService.isAuthenticated()) {
                flow.redirect(routes.user.select.url, function () {
                    flow.redirect(routes.user.user.url);
                });
            }

            this.model = userService.userModel();
            this.message = userService.userMessage;

            $scope.languagesArr = [];

            $scope.languagesArrFn = function (query, querySelectAs) {

                var deferd = $q.defer();
                $scope.categories = Resources.languages.get({
                    'page[number]': 1,
                    'page[size]': 50,
                    'filter[name]': query
                });

                $scope.categories.$promise.then(function (response) {
                    $scope.languagesArr = response;
                    var result = [];
                    angular.forEach(response.data, function (obj, key) {
                        result.push(obj);
                    });
                    deferd.resolve(result);
                });
                return deferd.promise;
            };

            $scope.language_bundle = undefined;

            /*Image upload and submit*/
            this.image = {};

            this.save = function () {
                console.log("Submit data");
                /*
                 console.log("update user uploadme");


                 Resources.userImage.upload({
                 image: $scope.vm.uploadme,
                 data: {
                 attributes: {
                 image: $scope.vm.uploadme
                 }
                 }
                 },
                 function (response) {
                 console.log("upload image");
                 console.log(response);
                 }
                 );

                 */

            };
        }]);
