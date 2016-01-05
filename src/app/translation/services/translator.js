angular.module('just.translation')
  .factory('translator', function (translations, $log) {
    var locale = {
        lang: 'en'
      },
      translate = function (key) {
        var dictionaryIterator = null,
          result = "";

        for (dictionaryIterator in translations.dictionaries) {
          if (translations.dictionaries[dictionaryIterator][locale.lang][key]) {
            result = translations.dictionaries[dictionaryIterator][locale.lang][key];
            break;
          }
        }
        return result;
      };

    return {
      translate: translate
    };
  });
