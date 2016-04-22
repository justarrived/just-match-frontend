'use strict';

describe('LanguageCtrl', function () {

  beforeEach(module('just'));

  describe('LanguageCtrl:list', function () {

    var ctrl;
    var $scope;
    beforeEach(inject(function ($rootScope, $controller, $q) {
      var i18nService = {
        supportedLanguages: function () {},
        getLanguage: function () {}
      };
      var allLangDefer = $q.defer();
      allLangDefer.resolve([{id:"1"}, {id:"2"}]);

      var langDefer = $q.defer();
      langDefer.resolve({id:"1"});

      spyOn(i18nService, 'supportedLanguages').and.returnValue(allLangDefer.promise);
      spyOn(i18nService, 'getLanguage').and.returnValue(langDefer.promise);

      $scope = $rootScope.$new();
      ctrl = $controller('LanguageCtrl', {$scope: $scope, i18nService: i18nService});
    }));

    it('should have have a default of languages', function () {
      // Make promise visible.
      $scope.$digest();
      expect(ctrl.language.id).toBe("1");
    });

    it('should have have a list of languages', function () {
      // Make promise visible.
      $scope.$digest();
      expect(ctrl.languages.length).toBe(2);
    });

  });

});