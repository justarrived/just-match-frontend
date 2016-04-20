/**
 * @ngdoc service
 * @name just.service.service:commentService
 * @description
 * # commentService
 * Service to handle comments.
 */
angular.module('just.service')
    .service('commentService', ['Resources', function (Resources) {
        var that = this;

        this.getComments = function (resource_name, resource_id, include) {
            return Resources.comments.get({resource_name: resource_name, resource_id: resource_id, include: include});
        };

    }]);
