// Creating an express server
var express = require('express'),
	app = express();

// This is needed if the app is run on heroku and other cloud providers:
var port = process.env.PORT || 3333;

// Initialize a new socket.io object. It is bound to 
// the express app, which allows them to coexist.
var io = require('socket.io').listen(app.listen(port));


// App Configuration
// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/app'));


var players = []; //list of current players
var _refreshRopeInterval;
var _score = 0;
var _oldScore = 0;
var _strength = 1;

var MAX_REPEATS = 50;
var _currentRepeat = 0;

var AWAY_TIMEOUT = 40;

var isGameInProgress = false;

// Initialize a new socket.io application
var game_socket = io.on('connection', function (socket) {
	socket.on('signup:action', function(data){
        if(data.isPLayer)
        {
            var _team = getTeam();
            players.push({
                uid: data.uid,
                team: _team,
                ticker:0
            }); // add new player to player list
            
            game_socket.emit('signup:emitter', {
                newplayer:players[players.length-1],
                isGameinProgress:isGameInProgress
		    });
            
            console.log('________________________________________');
            console.log('Incoming :: player');
            console.dir({uid:data.uid, team:_team});
            console.log('________________________________________');
        }else{
            console.log('________________________________________');
            console.log('Incoming :: spectator');
            console.log('________________________________________');
            
            game_socket.emit('signup:emitter', {
                isGameinProgress:isGameInProgress
		    });
        }
	});
    
    socket.on('startgame:action', function(data){
        if(!isGameInProgress){
            console.log('startgame:action');
            isGameInProgress = true;
            game_socket.emit('startgame:emitter', {});
            _refreshRopeInterval = setInterval(onTick, 250);
        }
    });
    
    function getTeam(){
        var team0 = 0;
        var team1 = 0;
        
        for(var i = 0; i < players.length; i++)
        {
            players[i].team === 0?team0++:team1++;
        }
            
        return team0>team1?1:0;
    }
    
    socket.on('tug:action', function(data){

        //reset ticker by UID
        players.forEach(function (player, index) {
            if(player.uid === data.uid)
            {
                player.ticker = 0; // reset timeout
            }
        });
        
        if(data.team === 0){
            _score -= _strength;
        }else{
            _score += _strength;
        }
	});
    
    function onTick(){
        
        checkPlayersTicker();
        
        if(_oldScore === _score){
            _currentRepeat++;
        }else{
             _oldScore = _score;
            _currentRepeat = 0;
        }
        
        if(_currentRepeat < MAX_REPEATS){
            game_socket.emit('tug:emitter', {
                score:_score
            });
        }
    }
    
    function checkPlayersTicker(){
        players.forEach(function (player, index) {
            if(player.ticker > AWAY_TIMEOUT)
            {
               /* console.log(player.uid + " has timed out!");
                
                kickPlayer(player); // kick player out and notify him
                
                players.splice(index, 1); // remove player from the list*/
                
            }else{
                player.ticker++;
            }
        });
    }
    
    function kickPlayer(player){
        console.log(player.uid + " has been kicked!");
        
        // tell the player
        game_socket.emit('kicked:emitter', {
            uid:player.uid
        });
    }
    
    socket.on('ping:action', function(data){
		
	});

});

console.log('XLAB /// TugOfWar is running on http://localhost:' + port);