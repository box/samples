(function () {

  'use strict';

  angular
    .module('authApp', ['auth0.auth0', 'angular-jwt', 'ngMaterial', 'ui.router', 'appAuth.home'])
    .config(config);

  config.$inject = ['$provide', '$urlRouterProvider', '$stateProvider', '$httpProvider', 'angularAuth0Provider', 'jwtOptionsProvider', 'jwtInterceptorProvider', '$mdThemingProvider', '$mdIconProvider', '$locationProvider'];
  function config($provide, $urlRouterProvider, $stateProvider, $httpProvider, angularAuth0Provider, jwtOptionsProvider, jwtInterceptorProvider, $mdThemingProvider, $mdIconProvider, $locationProvider) {

    angularAuth0Provider.init({
      clientID: AUTH0_CLIENT_ID,
      domain: AUTH0_DOMAIN,
      responseType: 'token id_token',
      audience: 'urn:box-platform-api',
      redirectUri: window.location.href
    });

    $locationProvider.hashPrefix('');

    $mdIconProvider
      .defaultIconSet("./assets/svg/avatars.svg", 128)
      .icon("menu", "./assets/svg/menu.svg", 24)
      .icon("share", "./assets/svg/share.svg", 24)
      .icon("google_plus", "./assets/svg/google_plus.svg", 512)
      .icon("hangouts", "./assets/svg/hangouts.svg", 512)
      .icon("twitter", "./assets/svg/twitter.svg", 512)
      .icon("phone", "./assets/svg/phone.svg", 512);
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('yellow');

    jwtOptionsProvider.config({
      whiteListedDomains: ['https://*.box.com, https://webtask.it.auth0.com'],
      tokenGetter: function () {
        return localStorage.getItem(AUTH0_ID_TOKEN_STORAGE_KEY);
      },
      unauthenticatedRedirectPath: '/'
    });

    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('splash', {
        url: '/',
        templateUrl: './js/splash/splash.html'
      })
      .state('home', {
        url: '/home',
        templateUrl: './js/home/home.html',
        controller: 'HomeCtrl',
        authenticateRoute: true
      });

    $httpProvider.interceptors.push('jwtInterceptor');
    var APP_CONFIG = {
      VARIABLES: {
        BOX_REFRESH_TOKEN_URL: BOX_REFRESH_TOKEN_URL,
        AUTH0_PROFILE_STORAGE_KEY: AUTH0_PROFILE_STORAGE_KEY,
        AUTH0_ID_TOKEN_STORAGE_KEY: AUTH0_ID_TOKEN_STORAGE_KEY,
        AUTH0_IS_AUTHENTICATED: AUTH0_IS_AUTHENTICATED,
        BOX_TOKEN: BOX_TOKEN,
        BOX_EXPIRES_AT: BOX_EXPIRES_AT
      },
      EVENTS: {
        START_LOADING: START_LOADING,
        FINISH_LOADING: FINISH_LOADING,
        AUTH0_LOGIN_STARTED: AUTH0_LOGIN_STARTED,
        AUTH0_LOGIN_COMPLETED: AUTH0_LOGIN_COMPLETED,
        AUTH0_LOGOUT_COMPLETED: AUTH0_LOGOUT_COMPLETED,
        AUTH0_SETTING_USER_PROFILE: AUTH0_SETTING_USER_PROFILE,
        AUTH0_USER_PROFILE_SET: AUTH0_USER_PROFILE_SET
      }
    }
    $provide.constant('APP_CONFIG', APP_CONFIG);
  }
})();

