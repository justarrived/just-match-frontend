angular.module('just.service')
  /**
   * @ngdoc service
   * @name just.service.service:justFlowService
   * @description
   *
   * Handles the "flow" of the application. A function can span over multiple
   * pages and also have different side flows, eg. sigin or not.
   *
   * When a flow needs to be redirected a call use
   * {@link just.service.service:justFlowService redirect}
   * This will put the onComplete on a stack that will be called when a
   * {@link just.service.service:justFlowService completed} is called.
   *
   */

  .service('justFlowService', ['$location', '$route', function ($location, $route) {
    var that = this;
    this.stack = [];

    this.reload = function (path) {
      $location.path(path);
      $route.reload();
    };

    /**
     * @ngdoc method
     * @name redirect
     * @methodOf just.service.service:justFlowService
     * @param {string}
     *            path to go
     * @param {string}
     *            onComplete function to push on the stack.
     *
     */
    this.redirect = function(path, onComplete) {
      if (angular.isFunction(onComplete)) {
        that.stack.push(onComplete);
      }
      $location.path(path);
    };

    this.replace = function(path, onComplete){
      if (angular.isFunction(onComplete)) {
        that.stack.push(onComplete);
      }
      $location.path(path).replace();
    };

    this.push = function(fn) {
      if (angular.isFunction(fn)) {
        that.stack.push(fn);
      }
    };

    this.next = function(path, data) {
      that.next_data = data;
      $location.path(path);
    };

    /**
     * @ngdoc method
     * @name completed
     * @methodOf just.service.service:justFlowService
     * @param {string}
     *            path to go
     * @param {string}
     *            data to store in this.completed_data for others to use.
     * @decription
     * complete() should be called when a flow is finished.
     * If an other flow exists on the stack that function will be called.
     * else it will route to path.
     */
    this.completed = function(path, data) {
      if (that.stack.length > 0) {
        that.stack.pop()();
        return;
      }
      that.completed_data = data;
      $location.path(path);
    };
  }]);
