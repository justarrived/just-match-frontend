angular.module('just.common')
    .controller('ConfirmationCtrl', ['justFlowService', 'justRoutes', 'localStorageService',
        function (flow, routes, storage) {
            var that = this;
            
            if (flow.next_data) {
                that.text = {
                    title: flow.next_data.title,
                    description: flow.next_data.description,
                    submit: flow.next_data.submit,
                    showViewProfileButton: flow.next_data.showViewProfileButton,
                    url : flow.next_data.url
                };
                storage.set("confirmationObject", that.text);
            }else{
                that.text = storage.get("confirmationObject");
            }

            this.process = function () {
                if(flow.next_data){
                    flow.completed();
                }else{
                    flow.replace(that.text.url);
                }
            };

            this.gotoViewProfilePage = function () {
                flow.replace(routes.user.user.url);
            };
        }]);
