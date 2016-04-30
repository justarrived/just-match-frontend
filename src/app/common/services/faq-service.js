/**
 * @ngdoc service
 * @name just.service.service:faqService
 * @description
 * # faqService
 * Service to handle FAQ's.
 */
angular.module('just.service')
  .service('faqService', ['i18nService', 'Resources', '$q',  function (i18nService, resources, $q) {

    var that = this;

    this.getFaqs = function() {
      return that.faqsResolve;
    };

    this.faqsResolve = $q(function(resolve, reject) {
      resources.faqs.query({id: i18nService.getLanguage().id}, function(faqs) {
        resolve(faqs);
      });
    });

  }]
);
