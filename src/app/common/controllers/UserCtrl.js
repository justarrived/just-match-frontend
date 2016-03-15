angular.module('just.common')
  .controller('UserCtrl', ['userService', function (userService) {
    this.model = userService.userModel();
    this.message = userService.userMessage;
  }]
);
