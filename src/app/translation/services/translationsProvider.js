angular.module('just.translation')
  .provider('translations', function () {
    var that = this;
    this.dictionaries = [];

    this.register = function (moduleName) {
      var module = angular.injector([moduleName]),
          dictionary;

      if(!module) {
        throw new Error("Could not resolve module:", moduleName);
      }

      dictionary = module.get('translations');

      if(!dictionary) {
        throw new Error("Could not find dependency .translations in module:", moduleName);
      }

      that.dictionaries.push(dictionary);
    };


    this.$get = function() {
      return this;
    };

  }
);
