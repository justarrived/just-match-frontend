angular.module('just.common')
    .controller('ConfirmationCtrl', ['justFlowService', 'justRoutes', 'localStorageService',
        function (flow, routes, storage) {
            var that = this;
            if (flow.next_data) {
                that.text = {
                    title: flow.next_data.title,
                    description: flow.next_data.description,
                    submit: flow.next_data.submit,
                    showViewProfileButton: flow.next_data.showViewProfileButton
                };
                storage.set("confirmationObject", that.text);
            }else{
                that.text = storage.get("confirmationObject");
            }

            this.process = function () {
                flow.completed();
            };

            this.gotoViewProfilePage = function () {
                flow.replace(routes.user.user.url);
            };
        }]);
