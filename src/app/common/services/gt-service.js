/**
 * @ngdoc service
 * @name just.service.service:gtService
 * @description
 * # gtService
 * Service to handle translation via google translate api.
 */
angular.module('just.service')
    .service('gtService', ['i18nService', '$http', 'settings', function (i18nService, $http, settings) {
        var that = this;

        i18nService.supportedLanguages()
            .then(function (langs) {
                that.allLanguages = langs;
            });
        i18nService.getLanguage()
            .then(function (lang) {
                that.setLanguage(lang);
            });
        i18nService.addLanguageChangeListener(function (lang) {
            that.setLanguage(lang);
        });

        this.setLanguage = function (lang) {
            this.targetLanguage = lang['lang-code'];
            this.targetLanguageName = lang['en-name'];
            this.targetLanguageDirection = lang.direction;
        };

        this.translate = function (content) {
            var url = settings.google_translate_api_url + settings.google_translate_api_key + "&q=" + encodeURIComponent(content) + "&target=" + that.targetLanguage;
            return $http({
                method: 'GET',
                url: url
            }).then(
                function (response) {
                    return {
                        translatedText: response.data.data.translations[0].translatedText,
                        detectedSourceLanguage: response.data.data.translations[0].detectedSourceLanguage,
                        detectedSourceLanguageName: that.getLanguageName(response.data.data.translations[0].detectedSourceLanguage),
                        targetLanguage: that.targetLanguage,
                        targetLanguageName: that.targetLanguageName,
                        targetLanguageDirection: that.targetLanguageDirection
                    };
                }
            );
        };

        this.getLanguageName = function(langCode) {
            angular.forEach(that.allLanguages, function (obj, key) {
                if(obj['lang-code'] === langCode) {
                    return obj['en-name'];
                }
            });
        };
    }]);
