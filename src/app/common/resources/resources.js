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
                        'remove': {
                            method: 'DELETE'
                        },
                        'query': {
                            method: 'GET'
                        }
                    });
            };

            return {
                users: crud("users"),
                user: crud("users/:id"),

                chatMessage: crud("chats/:id/messages"),

                chats: crud("chats"),
                chat: crud("chats/:id"),

                languages: crud("languages"),

                comments: crud(":resource_name/:resource_id/comments"),
                comment: crud(":resource_name/:resource_id/comments/:id"),

                jobSkills: crud("jobs/:job_id/skills"),
                jobSkill: crud("jobs/:job_id/skills/:id"),

                jobUsers: crud("jobs/:job_id/users"),
                jobUser: crud("jobs/:job_id/users/:id"),

                jobs: crud("jobs"),
                job: crud("jobs/:id"),

                contact: crud("contacts"),

                categories: crud("categories")

            };
        }
    ]);
