(function () {

  'use strict';

  angular
    .module('authApp')
    .service('boxApiService', BoxApiService);
  BoxApiService.$inject = ['$q', '$http', '$window', 'boxTokenSerivce', 'APP_CONFIG'];
  function BoxApiService($q, $http, $window, boxToken, APP_CONFIG) {
    var box = new $window.BoxSdk();
    this.persistentBoxClient = function () {
      return new box.PersistentBoxClient({ accessTokenHandler: boxToken.getAccessToken, httpService: $http, Promise: $q, storage: "sessionStorage" });
    };
    this.persistentBoxClientOptionsOnly = function () {
      return new box.PersistentBoxClient({ accessTokenHandler: boxToken.getAccessToken, noRequestMode: true, storage: "sessionStorage" });
    }
  }
})();