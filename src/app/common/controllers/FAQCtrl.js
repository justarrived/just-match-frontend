angular.module('just.common')
  .controller('FAQCtrl', function () {

    var that = this;

    // NOTE: How to add translated strings?
    this.faqs = [{
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      answer: "Mauris mollis fermentum purus sed sodales.",
      visible: false
    }, {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      answer: "Mauris mollis fermentum purus sed sodales.",
      visible: false
    }, {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      answer: "Mauris mollis fermentum purus sed sodales.",
      visible: false
    }];

    this.toggle = function (index) {
      that.faqs[index].visible = !that.faqs[index].visible;
    };
  });
