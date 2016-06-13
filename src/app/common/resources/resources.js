/**
 * @ngdoc service
 * @name just.common.resources:Resources
 * @description
 * # Resources
 * Handles interaction with backend resources.
 * On a resources the following methods are supported:
 * * get
 * * list
 * * create
 * * update
 * * remove
 * * query
 *
 * # Supported Resources
 *   * {@link https://just-match-api-staging.herokuapp.com/api_docs/1.0/users.html users}
 *   * {@link https://just-match-api-staging.herokuapp.com/api_docs/1.0/chats.html chats}
 *   * {@link https://just-match-api-staging.herokuapp.com/api_docs/1.0/languages.html languages}
 *   * ...
 *
 * {@link https://just-match-api-staging.herokuapp.com/api_docs/1.0 Backend Api}
 */
angular.module('just.common')
    .factory('Resources', ['$resource', 'settings',
        function ($resource, settings) {

            var crud = function (url) {
                return $resource(settings.just_match_api + settings.just_match_api_version + url, {},
                    {
                        'get': {
                            method: 'GET'
                        },
                        'list': {
                            method: 'GET'
                        },
                        'create': {
                            method: 'POST'
                        },
                        'update': {
                            method: 'PUT'
                        },
                        'save': {
                            method: 'PATCH'
                        },
                        'remove': {
                            method: 'DELETE'
                        },
                        'query': {
                            method: 'GET'
                        },
                        'upload': {
                            method: 'POST',
                            headers: {'Content-Type': undefined, enctype: 'multipart/form-data'}
                        }
                    });
            };

            return {
                users: crud("users"),
                user: crud("users/:id"),

                userJobs: crud("users/:user_id/jobs"), //for user
                userOwnedJobs: crud("users/:user_id/owned-jobs"),  //for owner
                userImage: crud("users/images"),
                userImageId: crud("users/:user_id/images/:id"),
                userResetPassword: crud("users/reset-password"),
                userChangePassword: crud("users/change-password"),

                userNotifications: crud("users/notifications"),
                userMessages: crud("users/:user_id/messages"),

                userLanguages: crud("users/:user_id/languages"),

                chatMessage: crud("chats/:id/messages"),

                chats: crud("chats"),
                chat: crud("chats/:id"),
                userChat: crud("users/:user_id/chats"),

                languages: crud("languages"),
                userLanguage: crud("users/:user_id/languages"),
                userLanguageId: crud("users/:user_id/languages/:user_language_id"),

                comments: crud(":resource_name/:resource_id/comments"),
                comment: crud(":resource_name/:resource_id/comments/:id"),

                jobSkills: crud("jobs/:job_id/skills"),
                jobSkill: crud("jobs/:job_id/skills/:id"),

                jobUsers: crud("jobs/:job_id/users"),   //for owner
                jobUser: crud("jobs/:job_id/users/:id"), //for owner


                jobs: crud("jobs"),
                job: crud("jobs/:id"),

                contact: crud("contacts"),

                categories: crud("categories"),

                faqs: crud("faqs?filter[language-id]=:id"),

                companies: crud("companies"),
                company: crud("companies/:company_id"),

                companyImageUpload: crud("companies/images"),
                companyImage: crud("companies/:company_id/images/:id"),

                hourly_pays: crud("hourly-pays"),

                rating: crud("jobs/:job_id/ratings"),
                userRating: crud("users/:id/ratings"),

                invoice: crud("jobs/:job_id/users/:job_user_id/invoices"),
                finance: crud("users/:user_id/frilans-finans"),

                arriverTermsAgreements: crud('terms-agreements/current'),
                companyTermsAgreements: crud('terms-agreements/current-company'),

                termsConsents: crud('terms-consents'),

                promoCode: crud('promo-codes/validate')

            };
        }
    ]);
