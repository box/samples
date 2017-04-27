
(function () {

  'use strict';

  angular
    .module('authApp')
    .run(run);
  run.$inject = ['$rootScope', 'authManager', 'jwtHelper', '$location', '$state', 'authenticationService', 'APP_CONFIG'];
  function run($rootScope, authManager, jwtHelper, $location, $state, authenticate, APP_CONFIG) {

    authenticate.handleParseHash();
    // authenticate.registerAuthenticationListener();
    authManager.checkAuthOnRefresh();
    authManager.redirectWhenUnauthenticated();

    $rootScope.$on('$stateChangeStart', function (e, toState) {
      var authToken = localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_ID_TOKEN_STORAGE_KEY) || '';
      var profile = JSON.parse(localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_PROFILE_STORAGE_KEY)) || {};
      
      if (toState.authenticateRoute && (!authToken)) {
        authenticate.logout();
        $state.transitionTo('splash');
        e.preventDefault();
      } else if (toState.authenticateRoute) {
        try {
          if (jwtHelper.isTokenExpired(authToken) || (jwtHelper.decodeToken(authToken).sub !== profile.sub)) {
            authenticate.logout();
            $state.transitionTo('splash');
            e.preventDefault();
          }
        } catch (err) {
          console.log("found an error!");
          authenticate.logout();
          $state.transitionTo('splash');
          e.preventDefault();
        }
      }
    });
  }
})();