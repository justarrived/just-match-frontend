angular.module('just.common')
  .controller('SigninCtrl', ['userService', function (userService) {
      var that = this;
      this.data = userService.signinModel;
      this.message = userService.signinMessage;
      this.process = function() {
        userService.signin(that.data);
      };
    }]
  );
