angular
    .module('just.common')
    .directive('userArriverChatHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-arriver-chat-header.html'
        };
    })
    .directive('userCompanyChatHeader', function () {
        return {
            restrict: 'E',
            // scope: { model: '=model' },
            templateUrl: 'common/templates/user-company-chat-header.html'
        };
    });