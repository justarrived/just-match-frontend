angular
  .module('just.common')
  .controller('ContactCtrl', ['contactService', function (contactService) {
    var that = this;
    this.data = contactService.model;
    this.message = contactService.message;
    this.process = function() {
      contactService.process(that.data);
    };
}]);
