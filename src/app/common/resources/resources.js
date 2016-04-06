angular.module('just.common')
  .factory('Resources', ['$resource', 'settings',
    function($resource, settings) {

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

        comments: crud("/api/v1/:resource_name/:resource_id/comments"),
        comment: crud("/api/v1/:resource_name/:resource_id/comments/:id"),

        jobSkills: crud("/api/v1/jobs/:job_id/skills"),
        jobSkill: crud("/api/v1/jobs/:job_id/skills/:id"),

        jobUsers: crud("/api/v1/jobs/:job_id/users"),
        jobUser: crud("/api/v1/jobs/:job_id/users/:id"),

        jobs: crud("/api/v1/jobs"),
        job: crud("/api/v1/jobs/:id"),

        contact: crud("/api/v1/contacts")
      };
    }
  ]);
