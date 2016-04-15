'use strict';
describe('I18nService', function () {

  beforeEach(module('just'));

  describe('I18NService', function () {

    var i18n;
    var localStorage;

    afterEach(inject(function($httpBackend){
      //These two calls will make sure that at the end of the test, all expected http calls were made
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function (i18nService, $httpBackend, localStorageService, settings) {
      i18n = i18nService;
      localStorage = localStorageService;

      // No cached version of language
      localStorageService.remove('language');
      $httpBackend.expectGET(settings.just_match_api + '/api/v1/languages?filter[system_language]=true').respond(200, JSON.stringify(
        {
          "data": [
            {
              "id": "155",
              "type": "languages",
              "attributes": {
                "lang-code": "sv",
                "en-name": "Swedish",
                "direction": "ltr",
                "local-name": "Svenska",
                "system-language": true
              }
            },
            {
              "id": "37",
              "type": "languages",
              "attributes": {
                "lang-code": "en",
                "en-name": "English",
                "direction": "ltr",
                "local-name": "English",
                "system-language": true
              }
            }
          ],
          "links": {}
        }
      ))
    }));


    it('should get default language sv', inject(function ($httpBackend) {
      var lang = i18n.getLanguage().then(function (lang) {
        expect(lang['lang-code']).toBe('sv');
      });

      //Because we're mocking an async action, ngMock provides a method for us to explicitly flush the request
      $httpBackend.flush();
    }));

    it('should get all system languages', inject(function ($httpBackend) {
      i18n.supportedLanguages().then(function (langs) {
        expect(langs.length).toBe(2);
      });

      //Because we're mocking an async action, ngMock provides a method for us to explicitly flush the request
      $httpBackend.flush();
    }));
    
    it("should notify when a language is set", inject(function ($httpBackend) {
        var called = false;
        i18n.addLanguageChangeListener(function (lang) {
          expect(lang.id).toBe("155");
          called = true;
        });
        i18n.useLanguageById("155");
        // This will wait until async operations are finished according to
        // http://stackoverflow.com/questions/24341544/getting-digest-already-in-progress-in-async-test-with-jasmine-2-0
        $httpBackend.flush();
        expect(called).toBe(true);
    }));
    it("should store language in local storage", inject(function ($httpBackend) {
      var lang = {};
      i18n.useLanguageById("155");
      i18n.addLanguageChangeListener(function (newLang) {
        // Should get from local storage.
        i18n.getLanguage().then(function (l) {
          expect(newLang.id).toEqual(l.id);
          lang = l;
        });
      });

      // This will wait until async operations are finished according to
      // http://stackoverflow.com/questions/24341544/getting-digest-already-in-progress-in-async-test-with-jasmine-2-0
      $httpBackend.flush();
      expect(lang.id).toBe("155");

    }));
  });
});