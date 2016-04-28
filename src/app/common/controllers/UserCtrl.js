angular.module('just.common')
    .controller('UserCtrl', ['userService', function (userService) {
        this.model = userService.userModel();
        this.message = userService.userMessage;
    }])
    .controller('UserJobsCtrl', ['userService', function (userService) {
        this.model = userService.userModel();
        this.message = userService.userMessage;

        console.log("company_id:"+userService.companyId());
    }]);
