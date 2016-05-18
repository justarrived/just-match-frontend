angular.module('just.common')
    .controller('ConfirmationCtrl', ['justFlowService',
        function (flow) {
            this.text = {
                title: flow.next_data.title,
                description: flow.next_data.description,
                submit: flow.next_data.submit
            };

            this.process = function () {
                flow.completed();
            };
        }]);
