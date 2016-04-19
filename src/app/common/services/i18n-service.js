/**
 * @ngdoc service
 * @name just.service.service:i18nService
 * @description
 * # i18nService
 * Service to handle language settings.
 */
angular.module('just.service')
  .service('i18nService', [
    '$translate', 'tmhDynamicLocale', 'settings',
    'localStorageService', 'justFlowService',
    'justRoutes', 'Resources', '$q', function ($translate, tmhDynamicLocale, settings, storage, flow, routes, Resources, $q) {
      var that = this;

      this.getDefaultLang = function (langs) {
        var defLang = langs.filter(function (lang) {
          return lang.attributes.lang_code === 'sv';
        });

        if (defLang.length === 0) {
          return langs[0];
        }
        return defLang[0];
      };


      this.getSystemLanguages = function () {
        return Resources.languages.get({'filter[system-language]': true, 'page[size]' : 50});
      };


      this.langResolve = $q(function (resolve, reject) {
        that.allLanguages = Resources.languages.get(function (langs) {
          var lang = that.getDefaultLang(langs.data);
          that.updateLanguage(lang);
          resolve(lang);
        });
      });

      /**
       * @ngdoc function
       * @name just.service:i18nService#getLanguage
       * @methodOf just.service.service:i18nService
       *
       * @description
       * Method to get data form the backend api
       * @example
       * i18nService.getLanguage();
       * @returns {httpPromise} resolve with fetched data, or fails with error description.
       */
      this.getLanguage = function () {
        var language = storage.get("language");
        if (angular.isObject(language)) {
          return language;
        }
        return that.langResolve;
      };

      /**
       * @ngdoc function
       * @name just.service:i18nService#useLanguage
       * @methodOf just.service.service:i18nService
       *
       * @description
       * Method to get data form the backend api
       * @example
       * i18nService.useLanguage(lang);
       * @returns {httpPromise} resolve with fetched data, or fails with error description.
       */
      this.useLanguage = function (lang) {
        that.updateLanguage(lang);
        flow.completed(routes.global.start.url);
      };

      this.updateLanguage = function (lang) {
        $translate.use(lang.attributes.lang_code);
        tmhDynamicLocale.set(lang.attributes.lang_code);
        storage.set("language", lang);
      };


      this.supportedLanguages = function () {
        return that.allLanguages;
      };
    }]);

