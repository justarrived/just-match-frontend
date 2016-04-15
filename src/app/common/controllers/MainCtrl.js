angular.module('just.common')
  .controller('MainCtrl', ['authService', '$location', 'justFlowService', 'justRoutes', 'i18nService', '$scope', function (authService, $location, flow, routes, i18nService, $scope) {
      var that = this;
      this.signedIn = function () {
        return authService.isAuthenticated();
      };
      this.signout = function () {
        authService.logout();
        flow.completed(routes.global.start.url);
      };
      this.signin = function () {
        var path = $location.path();
        flow.redirect(routes.user.signin.url, function () {
          flow.reload(path);
        });
      };
      this.selectLanguage = function () {
        var path = $location.path();
        flow.redirect(routes.global.select_language.url, function () {
          flow.reload(path);
        });
      };
      this.menu = function () {
        var path = $location.path();
        flow.redirect(routes.global.menu.url, function () {
          flow.reload(path);
        });
      };
      this.updateLanguage = function () {
        i18nService.getLanguage().then(function (lang) {
          that.language = lang;
        });
      };
      i18nService.addLanguageChangeListener(function () {
        that.updateLanguage();
      });
      this.updateLanguage();
    }]
  );
