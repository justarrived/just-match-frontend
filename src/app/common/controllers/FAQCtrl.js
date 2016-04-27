angular.module('just.common')
    .controller('FAQCtrl', ['faqService', function (faqService) {

        var that = this;

        this.buildFAQs = function () {
            var faqs = [];
            var faqsResources = faqService.getFaqs()
                .then(function (response) {
                    angular.forEach(response.data, function (f) {
                        faqs.push({question: f.attributes.question, answer: f.attributes.answer, visible: false});
                    });
                });
            return faqs;
        };

        this.toggle = function (index) {
            that.faqs[index].visible = !that.faqs[index].visible;
            if (that.faqs[index].visible) {
                angular.element("#faq_" + index).addClass("select");
            } else {
                angular.element("#faq_" + index).removeClass("select");
            }

        };

        this.faqs = this.buildFAQs();

    }]);
