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
                return $resource(settings.just_match_api + url, {},
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
                        'remove': {
                            method: 'DELETE'
                        },
                        'query': {
                            method: 'GET'
                        }
                    });
            };

            return {
                users: crud("/api/v1/users"),
                user: crud("/api/v1/users/:id"),

                chatMessage: crud("/api/v1/chats/:id/messages"),

                chats: crud("/api/v1/chats"),
                chat: crud("/api/v1/chats/:id"),

                languages: crud("/api/v1/languages"),

                comments: crud("/api/v1/:resource_name/:resource_id/comments?include=:include"),
                comment: crud("/api/v1/:resource_name/:resource_id/comments/:id"),

                jobSkills: crud("/api/v1/jobs/:job_id/skills"),
                jobSkill: crud("/api/v1/jobs/:job_id/skills/:id"),

                jobUsers: crud("/api/v1/jobs/:job_id/users"),
                jobUser: crud("/api/v1/jobs/:job_id/users/:id"),

                jobs: crud("/api/v1/jobs?include=:include&page[number]=:page_number&page[size]=:page_size"),
                job: crud("/api/v1/jobs/:id"),

                contact: crud("/api/v1/contacts"),

                categories: crud("/api/v1/categories"),

                faqs: crud("/api/v1/faqs?filter[language-id]=:id")

            };
        }
    ]);
//
//
//       };
//     }
//   ]);
// >>>>>>> Stashed changes
