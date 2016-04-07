/**
 * @ngdoc service
 * @name just.service.service:datastoreService
 * @description
 * # datastoreService
 * Service to handle data...
 */
angular.module('just.service')
  .service('datastoreService', ['settings', 'JsonApiDataStore', '$http', '$q',
    function(settings, jsonApiDataStore, $http, $q) {
      return {
        fetch: function (path) {
          return $http.get(settings.just_match_api + "/api/v1/" + path)
            .then(function (response) {
              if (typeof response.data === 'object') {
                // https://github.com/beauby/jsonapi-datastore
                jsonApiDataStore.store.sync(response.data);

                return jsonApiDataStore;
              } else {
                return $q.reject(response.data);
              }
            }, function (response) {
              return $q.reject(response.data);
            });
        }
      };
    }]);
