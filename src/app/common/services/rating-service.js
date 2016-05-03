/**
 * @ngdoc service
 * @name just.service.service:ratingService
 * @description
 * # ratingService
 * Service to handle Rating.
 */
angular.module('just.service')
    .service('ratingService', ['i18nService', 'Resources', function (i18nService, Resources) {

        var that = this;

        this.ratingModel = {data: {attributes: {}}};

        this.submitRating = function (job_id, data, fn) {
            data.data.attributes["language-id"] = parseInt(i18nService.getLanguage().$$state.value.id);
            Resources.rating.create({job_id: job_id}, data, function (response) {
                if (fn) {
                    fn(1);
                }
            }, function (error) {
                if (fn) {
                    fn(0);
                }
            });
        };


    }]);
