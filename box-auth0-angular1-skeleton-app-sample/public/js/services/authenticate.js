(function () {

  'use strict';

  angular
    .module('authApp')
    .service('authenticationService', AuthenticationService);
  AuthenticationService.$inject = ['$rootScope', 'angularAuth0', 'authManager', '$location', 'boxTokenSerivce', 'APP_CONFIG'];
  function AuthenticationService($rootScope, angularAuth0, authManager, $location, boxToken, APP_CONFIG) {
    var userProfile = JSON.parse(localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY)) || {};

    function login() {
      console.log("Started login process...");
      angularAuth0.login({
        scope: 'openid name email get:token'
      });
    }

    function logout() {
      console.log("Removing stored items...");
      console.log(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_ACCESS_TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_IS_AUTHENTICATED);
      localStorage.removeItem(APP_CONFIG.VARIABLES.BOX_TOKEN);
      sessionStorage.removeItem(APP_CONFIG.VARIABLES.BOX_TOKEN);
      authManager.unauthenticate();
      userProfile = {};
      $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_LOGOUT_COMPLETED);
    }

    function handleParseHash() {
      var authResult = angularAuth0.parseHash(window.location.hash)
      if (authResult && authResult.idToken) {
        console.log(authResult);
        setUser(authResult);
      }
    }

    function getIdToken() {
      var token = localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      return token;
    }

    function setUser(authResult) {
      localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY, authResult.idToken);
      localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_ACCESS_TOKEN_STORAGE_KEY, authResult.accessToken);
      localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_IS_AUTHENTICATED, true);
      authManager.authenticate();

      $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_SETTING_USER_PROFILE);
      angularAuth0.getUserInfo(authResult.accessToken, function (err, profile) {
        console.log("getting profile...");
        if (err) {
          return;
        }
        console.log(profile);
        localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY, JSON.stringify(profile));
        $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_USER_PROFILE_SET, profile);
      });
    }

    return {
      userProfile: userProfile,
      login: login,
      logout: logout,
      getIdToken: getIdToken,
      handleParseHash: handleParseHash
    }
  }
})();