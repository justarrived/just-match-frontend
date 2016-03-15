angular.module('just.common')
  .controller('RegisterCtrl', ['userService', 'Resources', function (userService, Resources) {
    var that = this;
    this.data = userService.registerModel;
    this.message = userService.registerMessage;
    this.languages = Resources.languages.get();

    this.process = function() {
      userService.register(that.data);
    };
  }]
);
