angular.module('just.common')
    .controller('RegisterCtrl', ['userService', 'justFlowService', function (userService, flow) {
        var that = this;

        this.data = userService.registerModel;
        this.message = userService.registerMessage;

        if(flow.next_data){
            //console.log(flow.next_data);
            this.data.company_id = flow.next_data.data.id;
        }

        this.process = function () {
            userService.register(that.data);
        };
    }]);
