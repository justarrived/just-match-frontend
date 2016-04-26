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
    .controller('UserCtrl', ['userService', '$scope', 'Resources', function (userService, $scope, Resources) {
        var that = this;
        this.model = userService.userModel();
        this.message = userService.userMessage;

        this.image = {};

        this.save = function () {
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


            /*Image.save($scope.newImage, function (result) {
             if (result.status != 'OK')
             throw result.status;

             $scope.images.push(result.data);
             });*/
        };
    }]);
