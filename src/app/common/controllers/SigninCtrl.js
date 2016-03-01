angular.module('just.common')
  .controller('SigninCtrl', ['justFlowService', function (justFlowService) {
      var that = this;
      this.data = justFlowService.model('signin');
      this.message = justFlowService.message('signin');
      this.process = function() {
        justFlowService.process('signin', that.data);
      };
    }]
  );
