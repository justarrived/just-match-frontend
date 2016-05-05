angular.module('just.common')
    .controller('RegisterCtrl', ['userService', 'justFlowService', function (userService, flow) {
        var that = this;

        this.data = userService.registerModel;
        this.message = userService.registerMessage;

        if(flow.next_data){
            this.data.company_id = flow.next_data.data.id;
        }

        this.process = function () {
            var element0 = angular.element("#file_upload");
            if (element0[0].files[0]) {
                var formData = new FormData();
                var element = angular.element("#file_upload");
                formData.append("image", element[0].files[0]);
                userService.register(that.data, formData);
            } else {
                userService.register(that.data);
            }

        };
    }]);
