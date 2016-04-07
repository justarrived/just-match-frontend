/**
 * @ngdoc service
 * @name just.service.service:contactService
 * @description
 * # jobService
 * Service to handle contact.
 */
angular.module('just.service')
  .service('contactService', ['justFlowService', 'justRoutes', 'Resources',function(flow, routes, resources) {
  var that = this;
  this.process = function (attributes) {
    resources.contact.create({data : {attributes: attributes}},
      function (ok) {
        flow.next(routes.contact.completed.url);
      }, function (error) {
        //TODO
        that.message = error;
        window.console.log(error);
      }
    );
  };
}]);
