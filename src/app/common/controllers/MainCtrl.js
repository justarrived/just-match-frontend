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
      this.selectLanguage = function (show) {
        //show = 1 : force open
        //show = 0 : force hide
        //show = undefined : toggle
        show = show | !routes.global.isSelectLanguageOpen;
        routes.global.isSelectLanguageOpen = show;
      };
      this.menu = function (show) {
        //show = 1 : force open
        //show = 0 : force hide
        //show = undefined : toggle
        show = show | !routes.global.isMainMenuOpen;
        routes.global.isMainMenuOpen = show;
      };

      that.language = i18nService.getLanguage();
      $scope.$on('language-change', function () {
        that.language = i18nService.getLanguage();
      });
    }]
  );
