'use strict';

/**
 * @ngdoc overview
 * @name tugofwarApp
 * @description
 * # tugofwarApp
 *
 * Main module of the application.
 */
var app = angular.module('tugofwarApp', ['ngRoute'])

app.config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/lobby.html',
                controller: 'LobbyCtrl'
            })
            .when('/player', {
                templateUrl: 'views/player.html',
                controller: 'PlayerCtrl'
            })
            .when('/spectator', {
                templateUrl: 'views/spectator.html',
                controller: 'SpectatorCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
});