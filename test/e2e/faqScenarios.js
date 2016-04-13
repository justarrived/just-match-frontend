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
      firstFaq.click();
      var firstFaqAnswer = firstFaq.all(by.className('answer')).first();
      expect(firstFaqAnswer.isDisplayed()).toBeTruthy();
      firstFaq.click();
      expect(firstFaqAnswer.isDisplayed()).toBeFalsy();
    });
  });
});
