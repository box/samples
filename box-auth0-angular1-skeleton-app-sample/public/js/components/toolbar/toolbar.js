(function () {

  'use strict';

  angular
    .module('authApp')
    .directive('toolbar', toolbar);

  function toolbar() {
    return {
      templateUrl: './js/components/toolbar/toolbar.html',
      controller: toolbarController
    }
  }

  var toolbarController = ['$scope', '$location', 'authenticationService', '$mdDialog', 'APP_CONFIG',
    function ($scope, $location, authenticate, $mdDialog, APP_CONFIG) {
      $scope.login = login;
      $scope.logout = logout;
      $scope.home = home;
      $scope.isAuthenticated = localStorage.getItem(APP_CONFIG.VARIABLES.AUTH0_IS_AUTHENTICATED) || false;
      
      function home() {
       $location.path('/home');
      }
      
      function login() {
        authenticate.login();
      }

      function logout() {
        authenticate.logout();
        $location.path('/');
      }

      $scope.$on(APP_CONFIG.EVENTS.AUTH0_LOGOUT_COMPLETED, function(e, args) {
        $scope.isAuthenticated = false;
      });
    }
  ];
})();

