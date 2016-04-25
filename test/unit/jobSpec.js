'use strict';

describe('JobCtrl', function () {

  beforeEach(module('just'));

  describe('JobCtrl:new', function () {

    var scope, ctrl;

    beforeEach(inject(function ($rootScope, $controller) {
      ctrl = $controller('JobCtrl');
    }));

    it('should default hours to 1', function () {
      expect(ctrl.hours).toBe(1);
    });

  });

});