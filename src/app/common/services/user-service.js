/**
 * @ngdoc service
 * @name just.service.service:userService
 * @description
 * # userService
 * Service to handle users.
 */
angular.module('just.service')
  .service('userService', ['justFlowService', 'authService', 'i18nService', 'justRoutes', 'Resources',  function (flow, authService, i18nService, routes, Resources) {
    var that = this;

    this.signinModel = {};
    this.signinMessage = {};

    this.signin = function (attributes, completeCb) {
      authService.login({data : {attributes: attributes}})
        .then(function (ok) {
          if (angular.isFunction(completeCb)) {
            completeCb();
          }
          flow.completed(routes.user.signed_in.url, ok);
        }, function (error) {
          that.signinMessage = error;
          flow.reload(routes.user.signin.url);
        });
    };

    this.registerModel = {language_id: i18nService.getLanguage().id};
    this.registerMessage = {};

    this.register = function (attributes) {
      that.registerModel = attributes;
      var user = Resources.user.create({data: {attributes: attributes}}, function () {
        flow.push(function () {
          flow.completed(routes.user.created.url, user);
        });
        that.signin(attributes);

      }, function (error) {
        that.registerMessage = error;
        flow.reload(routes.user.register.url);
      });
    };

    this.userModel = function() {
      if (angular.isUndefined(that.user)) {
        that.user = Resources.user.get({id: authService.userId()});
      }
      return that.user;
    };
  }]);
