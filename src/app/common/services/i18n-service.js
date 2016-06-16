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
        'justRoutes', '$q',
        'datastoreService', '$http', function ($translate, tmhDynamicLocale, settings, storage, flow, routes, $q, datastoreService, $http) {
            this.listeners = [];
            var that = this;

            this.getDefaultLang = function (langs) {
                var defLang = langs.filter(function (lang) {
                    return lang['lang-code'] === 'sv';
                });

                if (defLang.length === 0) {
                    return langs[0];
                }
                return defLang[0];
            };

            this.allLanguages = $q(function (resolve, reject) {
                datastoreService.fetch('languages?filter[system_language]=true')
                    .then(function (data) {
                        resolve(data.store.findAll('languages'));
                    }, reject);
            });

            this.reloadLang = function () {
                if (!this.allLanguages) {
                    this.allLanguages = $q(function (resolve, reject) {
                        datastoreService.fetch('languages?filter[system_language]=true')
                            .then(function (data) {
                                resolve(data.store.findAll('languages'));
                            }, reject);
                    });
                }
            };

            this.langResolve = function () {
                return $q(function (resolve, reject) {
                    that.allLanguages.then(function (langs) {
                        var lang = that.getDefaultLang(langs);
                        that.updateLanguage(lang);
                        resolve(lang);
                    }, reject);
                });
            };

            /**
             * @ngdoc function
             * @name just.service:i18nService#getLanguage
             * @methodOf just.service.service:i18nService
             *
             * @description
             * Get the language setting. The language will be defaulted to 'sv' initially.
             * The used language will be stored in the localStorageService with key 'language'.
             *
             * @example
             * i18nService.getLanguage();
             * @returns {Promise} resolve with current json-api language object, or fails with error description.
             */
            this.getLanguage = function () {
                var language = storage.get("language");
                if (angular.isObject(language)) {
                    if (angular.isUndefined(that.current_language)) {
                        that.useLanguage(language);
                    }
                    var deferd = $q.defer();
                    deferd.resolve(language);
                    return deferd.promise;
                }
                return that.langResolve();
            };

            /**
             * @ngdoc function
             * @name just.service:i18nService#useLanguage
             * @methodOf just.service.service:i18nService
             *
             * @description
             * Returns an array of all supported languages.
             * The array will be populated once the xhr requests is completed.
             *
             * @param {object} lang A language json-api object.
             * @returns {void} will redirect to routes.global.start.url.
             */
            this.useLanguage = function (lang) {
                that.updateLanguage(lang);
            };

            this.useLanguageById = function (id) {
                var idStr = id;
                if (angular.isNumber(id)) {
                    idStr = id.toString();
                }
                that.allLanguages.then(function (langs) {
                    var filteredLang = langs.filter(function (lang) {
                        return lang.id === idStr;
                    });
                    if (filteredLang.length === 1) {
                        that.useLanguage(filteredLang[0]);
                    }
                });
            };

            this.updateLanguage = function (lang) {
                $http.defaults.headers.common["X-API-LOCALE"] = lang['lang-code'];
                $translate.use(lang['lang-code']);
                tmhDynamicLocale.set(lang['lang-code']);
                storage.set("language", lang);
                that.current_language = lang;
                that.notifyChange(lang);
            };

            /**
             * @ngdoc function
             * @name just.service:i18nService#addBreakPoint
             * @methodOf just.service.service:i18nService
             *
             * @description
             * Save LanguageListener Standard Point
             * Call this before try to use addLanguageChangeListener in sub controller
             */
            this.addBreakPoint = function(){
                that.breakPoint = this.listeners.length;
            };

            /**
             * @ngdoc function
             * @name just.service:i18nService#addLanguageChangeListener
             * @methodOf just.service.service:i18nService
             *
             * @description
             * Register a function to be called when the langauge changes.
             * Should only be used by controllers that are long-lived (like MainCtrl)
             * else this will generate a memory leak.
             *
             * @param {function} cb is called when language is changed. The language object will be passed as first argument.
             */
            this.addLanguageChangeListener = function (cb) {
                if(that.breakPoint){
                    that.listeners = that.listeners.slice(0, that.breakPoint);
                }
                that.listeners.push(cb);
            };

            this.addLanguageChangeListenerContinue = function (cb) {
                that.listeners.push(cb);
            };

            this.notifyChange = function (lang) {
                this.listeners.forEach(function (cb) {
                    cb(lang);
                });
            };

            /**
             * @ngdoc function
             * @name just.service:i18nService#suppotedLanguage
             * @methodOf just.service.service:i18nService
             *
             * @description
             * Get all supported languages. The supported languages
             * has attribute system_language = true.
             *
             * @returns {promise} resolve with list of languages.
             */
            this.supportedLanguages = function () {
                return that.allLanguages;
            };
        }]);

