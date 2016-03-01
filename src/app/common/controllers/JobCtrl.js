angular.module('just.common')
  .controller('JobCtrl', ['justFlowService','justMatchApi', function (justFlowService, justMatchApi) {
    var that = this;

    this.data = justFlowService.model('job');
    this.message = justFlowService.message('job');

    justMatchApi.languages().then(function (data) {
      that.languages = data.data.data;
    });

    this.process = function () {
      justFlowService.process('job', that.data);
    };
  }]);
