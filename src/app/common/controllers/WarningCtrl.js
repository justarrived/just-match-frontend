angular.module('just.common')
    .controller('WarningCtrl', ['justFlowService', 'justRoutes', function (flow, routes) {
        var that = this;
        that.warning = {
            redirect: {
                url: routes.global.start.url
            }
        };

        if (flow.next_data) {
            that.warning = flow.next_data;
        }
    }]);
