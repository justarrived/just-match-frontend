/**
 * @ngdoc service
 * @name just.service.service:companyService
 * @description
 * # companyService
 * Service to handle companies.
 */
angular.module('just.service')
    .service('companyService', ['$q', 'justFlowService', 'authService', 'userService', 'Resources', 'justRoutes', 'i18nService', 'httpPostFactory', 'settings', '$filter',
        function ($q, flow, authService, userService, Resources, routes, i18nService, httpPostFactory, settings, $filter) {
            var that = this;

            this.registerModel = {};
            this.registerMessage = {};
            this.companyList = [];

            this.register = function (attributes, fn, fnSuccess) {
                that.registerConfirm(attributes, fn, fnSuccess);
            };

            this.registerConfirm = function (attributes, fn, fnSuccess) {
                attributes.language_id = i18nService.getLanguage().$$state.value.id;
                that.registerModel = attributes;

                Resources.companies.create({data: {attributes: attributes}}, function (data) {
                    //flow.next(routes.user.register.url, data);
                    if (fnSuccess) {
                        fnSuccess();
                    }
                    attributes.company_id = data.data.id;
                    userService.register(attributes, fn);

                }, function (error) {
                    that.registerMessage = error;
                    if (fn) {
                        fn();
                    }
                    //flow.reload(routes.company.register.url);
                });
            };

            this.choose = function (attributes, fn) {
                userService.register(attributes, fn);
            };

            this.addList = function (companyData) {
                var found = $filter('filter')(that.companyList, {data: {id: "" + companyData.data.id}}, true);
                if (found.length <= 0) {
                    that.companyList.push({data: companyData.data, included: companyData.included});
                }
            };

            this.getCompanyById = function (id) {
                var found = $filter('filter')(that.companyList, {data: {id: "" + id}}, true);
                if (found.length > 0) {
                    return found[0];
                } else {
                    return undefined;
                }
            };
        }]);
