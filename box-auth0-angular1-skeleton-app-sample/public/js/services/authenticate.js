(function () {

  'use strict';

  angular
    .module('authApp')
    .service('authenticationService', AuthenticationService);
  AuthenticationService.$inject = ['$rootScope', 'lock', 'authManager', '$location', 'boxTokenSerivce', 'APP_CONFIG'];
  function AuthenticationService($rootScope, lock, authManager, $location, boxToken, APP_CONFIG) {
    var userProfile = JSON.parse(localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY)) || {};

    function login() {
      console.log("Started login process...");
      lock.show();
    }

    function logout() {
      console.log("Removing stored items...");
      console.log(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONFIG.VARIABLES.AUTH0_IS_AUTHENTICATED);
      localStorage.removeItem(APP_CONFIG.VARIABLES.BOX_TOKEN);
      sessionStorage.removeItem(APP_CONFIG.VARIABLES.BOX_TOKEN);
      authManager.unauthenticate();
      userProfile = {};
      $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_LOGOUT_COMPLETED);
    }

    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {
        console.log("Authenicated...");
        console.log(authResult);
        localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY, authResult.idToken);
        console.log(authResult);
        authManager.authenticate();
        localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_IS_AUTHENTICATED, true);
        $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_SETTING_USER_PROFILE);
        lock.getProfile(authResult.idToken, function (error, profile) {
          if (error) {
            console.log(error);
          }

          localStorage.setItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY, JSON.stringify(profile));
          $rootScope.$broadcast(APP_CONFIG.EVENTS.AUTH0_USER_PROFILE_SET, profile);
        });
      });
    }

    function getIdToken() {
      var token = localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY);
      return token;
    }

    return {
      userProfile: userProfile,
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      getIdToken: getIdToken
    }
  }
})();