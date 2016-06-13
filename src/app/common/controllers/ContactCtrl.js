angular
    .module('just.common')
    /**
     * @ngdoc controller
     * @name just.common.controller:ContactCtrl
     *
     */
    .controller('ContactCtrl', ['contactService', 'authService', function (contactService, authService) {
        var that = this;
        this.data = contactService.model;
        this.message = contactService.message;

        authService.checkPromoCode();

        this.process = function () {
            contactService.process(that.data);
        };
    }]);
