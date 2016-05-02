/**
 * @ngdoc service
 * @name just.service.service:invoiceService
 * @description
 * # invoiceService
 * Service to handle Invoice.
 */
angular.module('just.service')
    .service('invoiceService', ['ratingService', 'settings', '$http', function (ratingService, settings, $http) {

        var that = this;

        this.createInvoice = function (job_id, job_user_id, fn) {
            var url = settings.just_match_api + settings.just_match_api_version + "jobs/" + job_id + "/users/" + job_user_id + "/invoices";

            $http({method: 'POST', url: url}).then(function (response) {
                if (fn) {
                    fn(1);
                }
            }, function (response) {
                if (fn) {
                    fn(0);
                }
            });
        };


    }]);
