'use strict';

describe('Job', function () {

  describe('Create new job', function () {
    beforeEach(function () {
      browser.get('#/new-job');
    });

    it('should show a form', function () {
      expect(element.all(by.tagName('form')).count()).toBe(1);
    });

    it('should contain the required fields', function () {
      [
        'ctrl.data.name',
        'ctrl.data.description',
        'ctrl.data.address',
        'ctrl.data.hours'
      ].map(function (field) {
        expect(element(by.model(field)).isPresent()).toEqual(true, field);
      });
    });

    it('should be possible to increment hours', function () {
      var addHourButton = element.all(by.css('[ng-click="ctrl.addHour()"]'));
      addHourButton.click();
      expect(element.all(by.model('ctrl.data.hours')).getAttribute('value')).toEqual("2");
    });
  });
});
