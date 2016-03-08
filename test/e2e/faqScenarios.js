'use strict';

describe('FAQ', function () {

  describe('Reading the FAQ', function () {
    beforeEach(function () {
      browser.get('#/faq');
    });

    it('should show a faq boxes', function () {
      expect(element.all(by.className('well')).count()).toBe(3);
    });

    it('should toggle answer on click', function () {
      var firstFaq = element.all(by.className('well')).first();
      var firstFaqAnswer = firstFaq.element.all(by.tagName('div')).first();

      console.log(firstFaq);
      console.log(firstFaqAnswer);
    });

    // it('should contain the required fields', function () {
    //   [
    //     'ctrl.data.name',
    //     'ctrl.data.description',
    //     'ctrl.data.address',
    //     'ctrl.data.hours'
    //   ].map(function (field) {
    //     expect(element(by.model(field)).isPresent()).toEqual(true, field);
    //   });
    // });

    // it('should be possible to increment hours', function () {
    //   var addHourButton = element(by.css('[ng-click="ctrl.addHour()"]'));
    //   addHourButton.click();
    //   expect(element(by.model('ctrl.data.hours')).getAttribute('value')).toEqual("2");
    // });
  });
});