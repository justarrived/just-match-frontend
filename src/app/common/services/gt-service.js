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

        $http({
            method: 'GET',
            url: settings.google_translate_api_url.replace('?key=', '/languages?key=') + settings.google_translate_api_key + "&target=en"
        }).then(function (response) {
            that.allGoogleLangauges = response.data.data.languages;
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
                        translatedText: angular.element('<textarea />').html(response.data.data.translations[0].translatedText).text(),
                        detectedSourceLanguage: response.data.data.translations[0].detectedSourceLanguage,
                        detectedSourceLanguageName: that.getSourceLanguageName(response.data.data.translations[0].detectedSourceLanguage),
                        detectedSourceLanguageDirection: that.getSourceDirection(response.data.data.translations[0].detectedSourceLanguage),
                        targetLanguage: that.targetLanguage,
                        targetLanguageName: that.targetLanguageName,
                        targetLanguageDirection: that.targetLanguageDirection
                    };
                }
            );
        };

        this.getSourceLanguageName = function (langCode) {
            var returnValue = "-";
            var len = that.allLanguages.length;
            var i = 0;
            for (i; i < len; i++) {
                if (that.allLanguages[i]['lang-code'] === langCode) {
                    return that.allLanguages[i]['en-name'];
                }
            }

            var keepGoing = true;
            if (that.allGoogleLangauges) {
                angular.forEach(that.allGoogleLangauges, function (val, key) {
                    if (keepGoing) {
                        if (langCode.localeCompare(val.language) === 0) {
                            returnValue = val.name;
                            keepGoing = false;
                        }
                    }
                });
            }

            return returnValue;
        };
        this.getSourceDirection = function (langCode) {
            var len = that.allLanguages.length;
            var i = 0;
            for (i; i < len; i++) {
                if (that.allLanguages[i]['lang-code'] === langCode) {
                    return that.allLanguages[i].direction;
                }
            }
            return "ltr";
        };


        this.translateCandidate = function (model) {

            that.translate(model.description)
                .then(function (translation) {
                    if (!model.translation) {
                        model.translation = {};
                    }
                    model.translation.description = {};
                    model.translation.description.text = translation.translatedText;
                    model.translation.description.from = translation.detectedSourceLanguage;
                    model.translation.description.from_name = translation.detectedSourceLanguageName;
                    model.translation.description.from_direction = translation.detectedSourceLanguageDirection;
                    model.translation.description.to = translation.targetLanguage;
                    model.translation.description.to_name = translation.targetLanguageName;
                    model.translation.description.to_direction = translation.targetLanguageDirection;
                });
            that.translate(model["job-experience"])
                .then(function (translation) {
                    if (!model.translation) {
                        model.translation = {};
                    }
                    model.translation.job_experience = {};
                    model.translation.job_experience.text = translation.translatedText;
                    model.translation.job_experience.from = translation.detectedSourceLanguage;
                    model.translation.job_experience.from_name = translation.detectedSourceLanguageName;
                    model.translation.job_experience.from_direction = translation.detectedSourceLanguageDirection;
                    model.translation.job_experience.to = translation.targetLanguage;
                    model.translation.job_experience.to_name = translation.targetLanguageName;
                    model.translation.job_experience.to_direction = translation.targetLanguageDirection;
                });
            that.translate(model["competence-text"])
                .then(function (translation) {
                    if (!model.translation) {
                        model.translation = {};
                    }
                    model.translation.competence_text = {};
                    model.translation.competence_text.text = translation.translatedText;
                    model.translation.competence_text.from = translation.detectedSourceLanguage;
                    model.translation.competence_text.from_name = translation.detectedSourceLanguageName;
                    model.translation.competence_text.from_direction = translation.detectedSourceLanguageDirection;
                    model.translation.competence_text.to = translation.targetLanguage;
                    model.translation.competence_text.to_name = translation.targetLanguageName;
                    model.translation.competence_text.to_direction = translation.targetLanguageDirection;
                });
            that.translate(model["competence-text"])
                .then(function (translation) {
                    if (!model.translation) {
                        model.translation = {};
                    }
                    model.translation.competence_text = {};
                    model.translation.competence_text.text = translation.translatedText;
                    model.translation.competence_text.from = translation.detectedSourceLanguage;
                    model.translation.competence_text.from_name = translation.detectedSourceLanguageName;
                    model.translation.competence_text.from_direction = translation.detectedSourceLanguageDirection;
                    model.translation.competence_text.to = translation.targetLanguage;
                    model.translation.competence_text.to_name = translation.targetLanguageName;
                    model.translation.competence_text.to_direction = translation.targetLanguageDirection;
                });
        };


    }]);
