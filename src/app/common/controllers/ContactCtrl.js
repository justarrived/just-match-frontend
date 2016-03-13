angular
  .module('just.common')
  .controller('ContactCtrl', ['justFlowService', function (justFlowService) {
    var that = this;
    this.data = justFlowService.model('contact');
    this.message = justFlowService.message('contact');
    this.process = function() {
      justFlowService.process('contact', that.data);
    };
}]);
