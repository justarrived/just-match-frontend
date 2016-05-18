/**
 * @ngdoc service
 * @name just.service.service:commentService
 * @description
 * # commentService
 * Service to handle comments.
 */
angular.module('just.service')
    .service('gtService', ['i18nService', '$http', 'settings', function (i18nService, $http, settings) {
        var that = this;

        this.setLanguage = function () {
            this.targetLanguage = i18nService.getLanguage().$$state.value['lang-code'];
            this.targetLanguageName = i18nService.getLanguage().$$state.value['en-name'];
            this.targetLanguageDirection = i18nService.getLanguage().$$state.value['direction'];
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
                        targetLanguage: that.targetLanguage,
                        targetLanguageName: that.targetLanguageName,
                        targetLanguageDirection: that.targetLanguageDirection
                    };
                }
            );
        };

        i18nService.addLanguageChangeListener(function () {
                that.setLanguage();
            }
        );

        setLanguage();
    }]);
