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

            this.register = function (attributes, formData) {
                if (formData) {
                    httpPostFactory(settings.just_match_api + settings.just_match_api_version + 'companies/images', formData, function (callback) {
                        var image_token = {};
                        image_token.data = {};
                        image_token.data.attributes = {};
                        image_token.data.attributes["user-image-one-time-token"] = callback.data.attributes["one-time-token"];
                        attributes["company-image-one-time-token"] = image_token.data.attributes["user-image-one-time-token"];
                        that.registerConfirm(attributes);
                    });
                } else {
                    that.registerConfirm(attributes);
                }
            };

            this.registerConfirm = function (attributes) {
                attributes.language_id = i18nService.getLanguage().$$state.value.id;
                that.registerModel = attributes;

                Resources.companies.create({data: {attributes: attributes}}, function (data) {
                    //flow.next(routes.user.register.url, data);
                    attributes.company_id = data.data.id;
                    userService.register(attributes);

                }, function (error) {
                    that.registerMessage = error;
                    flow.reload(routes.company.register.url);
                });
            };

            this.choose = function (attributes) {
                userService.register(attributes);
            };

            this.addList = function (companyData) {
                var found = $filter('filter')(that.companyList, {id: "" + companyData.data.id}, true);
                if (found.length === 0) {
                    that.companyList.push(companyData);
                }
            };

            this.getCompanyById = function(id) {
                var found = $filter('filter')(that.companyList, {id: "" + id}, true);
                if (found.length > 0) {
                    return found[0];
                }else{
                    return null;
                }
            };
        }]);
