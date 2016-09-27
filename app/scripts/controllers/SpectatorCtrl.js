'use strict';

/**
 * @ngdoc function
 * @name tugofwarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tugofwarApp
 */
angular.module('tugofwarApp')
  .controller('SpectatorCtrl', function ($location, $scope, $window, socket) {
    
    $scope.isGameInProgress = false;
    var CRACKER_HEIGHT = 388;
    
    socket.emit('signup:action', { isPLayer:false });
    
    function onSignupHandler(data){
        if(data.isGameinProgress){
            onGameStarted();
        }
    }
    
    $scope.startGame = function() {
        console.log('client :: startGame');
        socket.on('startgame:emitter', onGameStarted);
        socket.emit('startgame:action', {});
    }
    
    function onGameStarted(){
        $scope.isGameInProgress = true; // hide start game button
        socket.on('tug:emitter', onTugHandler);
    }
    
    function onTugHandler(data){
//        console.log(data.ropePosition);
        TweenLite.to(document.getElementById('cracker'), .25, {backgroundPosition:(-625 + data.ropePosition)+"px 0px"});
    }
    
    angular.element($window).bind('resize', onResizeHandler);
    
    function onResizeHandler(){
        $scope.height = $window.innerHeight;
        TweenLite.set(document.getElementById('stage'),  {height:$scope.height + "px"});
        TweenLite.to(document.getElementById('cracker'), .25,  {marginTop:(($scope.height/2) - (CRACKER_HEIGHT/2)) + "px", ease:Quad.easeOut});
    };
    
    function onResizeApplyHandler(){
        onResizeHandler();
        //update scope
        $scope.$apply();
    };
    
    onResizeHandler()
    
  });