angular.module('just.service', [])
    .service('i18nService', ['$translate','tmhDynamicLocale','settings', function($translate, tmhDynamicLocale, settings) {
        this.useLanguage = function(code) {
            $translate.use(code);
            tmhDynamicLocale.set(code);
        };
        this.supportedLanguages = function() {
            return settings.translated_languages;
        };
    }]);
