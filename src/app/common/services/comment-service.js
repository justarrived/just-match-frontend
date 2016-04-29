/**
 * @ngdoc service
 * @name just.service.service:commentService
 * @description
 * # commentService
 * Service to handle comments.
 */
angular.module('just.service')
    .service('commentService', ['Resources', 'i18nService', function (Resources, i18nService) {
        var that = this;

        this.getModel = function (resource_name, resource_id) {
            return {
                data: {
                    attributes: {
                        "language-id": i18nService.current_language.id,
                        "commentable-id": resource_id,
                        "commentable-type": resource_name
                    }
                }
            };
        };

        this.getComments = function (resource_name, resource_id, include) {
            return Resources.comments.get({resource_name: resource_name, resource_id: resource_id, 'include': include});
        };

    }]);
