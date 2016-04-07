'use strict';
var langs = {
  sv: {
    "id": "1",
    "type": "languages",
    "attributes": {
      "lang_code": "sv",
      "system_language": true
    }
  },
  en: {
    "id": "2",
    "type": "languages",
    "attributes": {
      "lang_code": "en",
      "system_language": true
    }
  }
};

describe('I18nService', function () {

  beforeEach(module('just'));

  describe('I18NService', function () {

    var i18n;

    afterEach(inject(function($httpBackend){
      //These two calls will make sure that at the end of the test, all expected http calls were made
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function (i18nService, $httpBackend, localStorageService) {
      i18n = i18nService;
      // No cached version of language
      localStorageService.remove('language');
      $httpBackend.expectGET('/api/v1/languages').respond(200, JSON.stringify(
        {
          "data": [
            langs.sv,
            langs.en
          ]
        }))
    }));


    it('should get default language sv', inject(function ($httpBackend) {
      var lang = i18n.getLanguage().then(function (lang) {
        expect(lang.id).toBe(langs.sv.id);
      });

      //Because we're mocking an async action, ngMock provides a method for us to explicitly flush the request
      $httpBackend.flush();
    }));

  });

});