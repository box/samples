(function () {

  'use strict';

  angular
    .module('authApp')
    .service('boxTokenSerivce', ['$q', '$http', '$window', 'APP_CONFIG', BoxTokenService]);

  function BoxTokenService($q, $http, $window, APP_CONFIG) {
    this.getAccessToken = function () {
      var deferred = $q.defer();
      var accessToken = $window.localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_ACCESS_TOKEN_STORAGE_KEY);
      $http({
        url: APP_CONFIG.VARIABLES.BOX_REFRESH_TOKEN_URL,
        method: 'GET',
        headers: { "Authorization": "Bearer " + accessToken }
      })
        .then(function (response) {
          deferred.resolve(response.data);
        }, function (response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }
  }
})();