angular.module('just.common')
  .controller('SigninCtrl', ['$scope', 'userService', function ($scope, userService) {
      var that = this;
      this.data = userService.signinModel;
      this.message = userService.signinMessage;
      this.process = function() {
        userService.signin(that.data);
      };
    }]
  );
