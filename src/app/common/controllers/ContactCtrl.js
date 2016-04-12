angular
  .module('just.common')
  /**
   * @ngdoc controller
   * @name just.common.controller:ContactCtrl
   *
   */
  .controller('ContactCtrl', ['contactService', function (contactService) {
    var that = this;
    this.data = contactService.model;
    this.message = contactService.message;
    this.process = function() {
      contactService.process(that.data);
    };
}]);
