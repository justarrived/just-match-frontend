angular.module('just.common')
    .controller('ConfirmationCtrl', ['justFlowService','justRoutes',
        function (flow,routes) {
            this.text = {
                title: flow.next_data.title,
                description: flow.next_data.description,
                submit: flow.next_data.submit,
                showViewProfileButton: flow.next_data.showViewProfileButton
            };

            this.process = function () {
                flow.completed();
            };

            this.gotoViewProfilePage = function(){
                flow.replace(routes.user.user.url);
            };
        }]);
