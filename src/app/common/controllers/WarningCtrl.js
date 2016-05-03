angular.module('just.common')
    .controller('WarningCtrl', ['justFlowService', 'justRoutes', function (flow, routes) {
        var that = this;
        that.warning = {
            text: 'warning text',
            redirect: {
                title: "Home",
                url: routes.global.start.url
            }
        };

        if (flow.next_data) {
            that.warning = flow.next_data;
        }
    }]);
