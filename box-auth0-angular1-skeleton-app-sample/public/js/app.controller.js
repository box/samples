(function () {

  'use strict';

  angular
    .module('authApp')
    .controller('AppCtrl', appCtrl);

  appCtrl.$inject = ['$scope', '$location', '$mdDialog', 'APP_CONFIG'];
  function appCtrl($scope, $location, $mdDialog, APP_CONFIG) {

    $scope.$on(APP_CONFIG.EVENTS.START_LOADING, function (e, args) {
      $scope.isLoading = true;
      var parent = angular.element(document.body);
      $mdDialog.show({
        parent: parent,
        templateUrl: './js/components/loading/loading.html'
      });
    });

    $scope.$on(APP_CONFIG.EVENTS.FINISH_LOADING, function (e, args) {
      $scope.isLoading = false;
      $mdDialog.cancel();
    });

    $scope.$on(APP_CONFIG.EVENTS.AUTH0_USER_PROFILE_SET, function (e, args) {
      $scope.$emit(APP_CONFIG.EVENTS.FINISH_LOADING);
      $location.path('/home');
    });

    $scope.$on(AUTH0_SETTING_USER_PROFILE, function (e, args) {
      $scope.$emit(APP_CONFIG.EVENTS.START_LOADING);
    });

    $scope.$on('$routeChangeSuccess', function (e, nextRoute) {
      if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
        $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Auth0 Sample';
      }
    });
  }
})();