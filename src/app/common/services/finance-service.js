/**
 * @ngdoc service
 * @name just.service.service:financeService
 * @description
 * # financeService
 * Service to handle finance.
 */
angular.module('just.service')
    .service('financeService', ['Resources', 'authService', '$http', 'settings', function (Resources, authService, $http, settings) {
        var that = this;

        this.financeModel = {data: {attributes: {}}};
        this.financeMessage = {};


        this.createBankAccount = function (fn) {
            var url = settings.just_match_api + settings.just_match_api_version + "users/" + authService.userId().id + "/frilans-finans";
            $http({method: 'POST', url: url, data: angular.toJson(that.financeModel)}).then(function (response) {
                if (fn) {
                    fn();
                }
            }, function (response) {
                that.jobMessage = response;
                if (fn) {
                    fn();
                }
            });
        };

    }]);
