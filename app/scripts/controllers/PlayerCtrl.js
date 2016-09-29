'use strict';

/**
 * @ngdoc function
 * @name tugofwarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tugofwarApp
 */
angular.module('tugofwarApp')
    .controller('PlayerCtrl', function ($scope, $window, socket) {

        $scope.uid = '';
        $scope.team = -1;
        $scope.countdownLabel = 3;
    
        // STATES
        $scope.state = 'button'; // wait by default
        $scope.WAIT = 'wait';
        $scope.COUNTDOWN = 'countdown';
        $scope.BUTTON = 'button';
        $scope.TIMEOUT = 'timeout';
    
        $scope.score = 0;
    
        $scope.teamLabel = "Blue";

        var pullH;
        var isGameInProgress = false;
        var countdownTimer = 0;
    
        function init(){
            
            $scope.uid = generateUID();
            socket.on('signup:emitter', onSignupHandler);
            socket.emit('signup:action', {
                isPLayer: true,
                uid: $scope.uid
            });
            
            pullH = new Hammer(document.getElementById('pull-button'), {
                interval: 100,
                time: 50
            });
        }

        function onSignupHandler(data) {
            
            if (data.newplayer.uid === $scope.uid) {
                // you joined
                $scope.team = data.newplayer.team;
                $scope.teamLabel = data.newplayer.team > 0 ? "RED":"BLUE";
                isGameInProgress = data.isGameinProgress;
                
                if(!data.isGameinProgress){
                    socket.on('startgame:emitter', onGameStarted);
                    socket.emit('startgame:action', {});
                }else{
                    setState($scope.BUTTON);
                }
                
            } else {
                //someone else joined
            }
        }
        
        function onGameStarted(data){
            setState($scope.BUTTON);
        }
    
        function onPlayerKickedHandler(data) {
            if (data.uid === $scope.uid) {
                alert('you just got kicked son! Refresh your page to get back in.');
                onKicked();
            }
        }
    
        function onKicked(){
            pullH.off('tap', onPullHandler);
        }

        function onPullHandler() {
            if ($scope.team >= 0) {
                socket.emit('tug:action', {
                    uid: $scope.uid,
                    team: $scope.team
                });
            }
        };
    
        function setState(newstate){
            
            $scope.state = newstate;
            
            switch($scope.state){
                case $scope.WAIT: //enter wait
                                startWaitingScreen();
                                break;
                case $scope.COUNTDOWN: //enter countdown
                                startCountdownScreen();
                                break;
                case $scope.BUTTON: //enter button screen
                                startButtonScreen();
                                break;
                case $scope.TIMEOUT: //enter timeout screen
                                startTimeoutScreen();
                                break;
                    
            }
            
            console.log($scope.state);
            
            //update scope
            //$scope.$apply();
        }
    
        function startWaitingScreen(){
            //add any extra functionality
        }
    
        function startCountdownScreen(){
            countdownTimer = setInterval(function(){
                if($scope.countdownLabel === 1)
                {
                    $scope.countdownLabel = "GO!"
                    $scope.$apply();
                    clearInterval(countdownTimer);
                    
                    setTimeout(function(){
                        $scope.countdownLabel = 3;
                        setState($scope.BUTTON);
                        $scope.$apply();
                    },1000);
                }else{
                    $scope.countdownLabel--;
                    $scope.$apply();
                }
            }, 1000);
        }
    
        function startButtonScreen() {
            socket.on('tug:emitter', onTugHandler);
            
            //add any extra functionality
            socket.on('kicked:emitter', onPlayerKickedHandler);
            pullH.on('tap', onPullHandler);
        }
    
        function onTugHandler(data){
    //        console.log(data.ropePosition);
            $scope.score = 50 + data.score;
            console.log("score: " + data.score);
            document.getElementById("score-bar").style.width = $scope.score + "%";
        }
    
        function startTimeoutScreen(){
            //add any extra functionality
        }

        // RESIZE
        angular.element($window).bind('resize', onResizeApplyHandler);

        function onResizeHandler() {
            /*$scope.height = $window.innerHeight;
            $scope.width = $window.innerWidth;
            TweenLite.set(document.getElementById('pull-button'), {
                height: $scope.height + "px",
                width: $scope.width + "px"
            });*/
        }
    
        function onResizeApplyHandler(){
            onResizeHandler();
            //update scope
            $scope.$apply();
        };

        // TOOLS

        function generateUID() {
            return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
        }
    
        
        //start
        onResizeHandler();
        init();

    });