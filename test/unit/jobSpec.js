'use strict';

describe('JobCtrl', function () {

  beforeEach(module('just'));

  describe('CreateJobCtrl:new', function () {

    var scope, ctrl;

    beforeEach(inject(function ($rootScope, $controller) {
      ctrl = $controller('CreateJobCtrl');
    }));

    it('should default hours to 1', function () {
      expect(ctrl.model.data.attributes.hours).toBe(1);
    });

  });

});