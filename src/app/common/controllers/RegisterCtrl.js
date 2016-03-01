angular.module('just.common')
  .controller('RegisterCtrl', ['justFlowService', 'justMatchApi', function (justFlowService, justMatchApi) {
    var that = this;
    this.data = justFlowService.model('account');
    this.message = justFlowService.message('account');
    justMatchApi.languages().then(function (data) {
      that.languages = data.data.data;
    });
    this.process = function() {
      justFlowService.process('account', that.data);
    };
  }]
);
