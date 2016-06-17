/*INITIALIZATION*/

	var express = require('express');
	var app = express();
	var serv = require('http').createServer(app);
	serv.listen(3000, "0.0.0.0");
	console.log('server started');
	var SOCKET_LIST = {};
	var io = require('socket.io')(serv, {});
	
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/client/index.html');
	});
	app.get('/main', function(req, res) {
		res.sendFile(__dirname + '/client/main_host.html');
	});
	app.get('/worldend', function(req, res) {
		res.sendFile(__dirname + '/client/worldend.html');
	})
	app.use('/client', express.static(__dirname + '/client'));

	var playerNumber = 1;
	var totalPlayers = 0;
	var numberOfPlayersInGroups = 0;
	var numberOfPlayersInTeams = 0;
	var numberOfGroups = 0;
	var numberOfTeams = 0;
	var world = 0;
	var roundNumber = 1;
	var quarter = 0;
	var ROUNDS = 12;
	var playerScores = {};
	var groupScores = {};
	var teamScores = {};
	var teamNameNumbers = {};
	var currentTeamNumber = 1;

	//decide whether a round is over based on the timer or once all players have made a decision
	//either timer or waitForPlayers
	var decisionMode = "waitForPlayers";

	//variables for timer
	var TIME_LIMIT = 10;
	var timer = TIME_LIMIT;

	//variables for waitForPlayers
	var decidedPlayers = 0;


/*LISTENERS*/

	io.sockets.on('connection', function(socket) {

		socket.id = playerNumber;
		SOCKET_LIST[socket.id] = socket;
		console.log('connection made');
		console.log(socket.id);
		playerNumber++;
		console.log('totalPlayers: ' + totalPlayers);

		socket.on('start', function(data) {
			world = data.numberOfTeams * 10;
			totalPlayers = data.numberOfPlayers;
			numberOfGroups = data.numberOfGroups;
			numberOfTeams = data.numberOfTeams;
			numberOfPlayersInGroups = data.numberOfPlayersInGroups;
			numberOfPlayersInTeams = data.numberOfPlayersInTeams;
		});
		
		socket.on('decision1', function(data) {
			world += -1;
			groupScores[socket.groupNumber] += -2;
			teamScores[socket.teamNumber] += -2;
			playerScores[socket.playerNumber] += 2;
			checkPlayers(decisionMode);
		});

		socket.on('decision2', function(data) {
			world += 0;
			groupScores[socket.groupNumber] += 2;
			teamScores[socket.teamNumber] += 2;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
		});
		
		socket.on('decision3', function(data) {
			world += -1;
			groupScores[socket.groupNumber] += 1;
			teamScores[socket.teamNumber] += 1;
			playerScores[socket.playerNumber] += 1;
			checkPlayers(decisionMode);
		});

		socket.on('decision4', function(data) {
			world += 2;
			groupScores[socket.groupNumber] += 0;
			teamScores[socket.teamNumber] += 0;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
		});

		socket.on('playerConnect', function(data) {
			socket.playerNumber = data.playerNumber + ((socket.groupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
			socket.groupNumber = data.groupNumber + ((socket.teamNumber-1) * (numberOfGroups));
			socket.teamNumber = data.teamNumber;
			if (!(socket.playerNumber in playerScores)){
				playerScores[socket.playerNumber] = 20;
			};
			
			if (!(socket.groupNumber in groupScores)){
				groupScores[socket.groupNumber] = 20;
			};
			
			if (!(socket.teamNumber in teamScores)){
				teamScores[socket.teamNumber] = 20 * numberOfGroups;
			};
			socket.emit('player', {
				number: socket.id
			});
			socket.emit('team', {
				team: teamScores[socket.teamNumber] 
			});

			socket.emit('world', {
				world: world
			});
			if (decisionMode == "timer") {
				socket.emit('timer', {
					timer: timer
				});
			};

			//associate team names and numbers
			if (!(data.teamName in teamNameNumbers)) {
				teamNameNumbers[data.teamName] = currentTeamNumber;
				console.log(currentTeamNumber);
				for (var i in SOCKET_LIST) {
					var emitSocket = SOCKET_LIST[i];
					emitSocket.emit('newTeam', {
						teamName: data.teamName,
						currentTeamNumber: currentTeamNumber
					});
				};
				currentTeamNumber++;
			};
			socket.teamNumber = teamNameNumbers[data.teamName];
			socket.groupNumber = [socket.teamNumber, data.groupNumberInput];
			if (!(socket.teamNumber in teamScores)){
				teamScores[socket.teamNumber] = 20 * numberOfGroups;
			};
			if (!(socket.groupNumber in groupScores)){
				groupScores[socket.groupNumber] = 20;
			};
			socket.emit('getTeamNumber', {
				teamNameNumbers: teamNameNumbers,
				groupNumber: socket.groupNumber
			});
			socket.emit('team', {
				team: teamScores[socket.teamNumber]
			});

		});
		
		socket.on('infoRequest', function() {
			socket.emit('player', {});
			socket.emit('team', {
				team: teamScores[socket.teamNumber] 
			});
			socket.emit('world', {
				world: world
			});
			socket.emit('timer', {
				timer: timer
			});
		});
	});


/*FUNCTIONS*/

	if (decisionMode == "timer") {
		//increment the timer
		setInterval(function() {
			for(var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.timer = timer;
				socket.emit('timer', {
					timer: socket.timer
				});
			};
			timer--;
		}, 1000);

		//timer resets every TIMER_LIMIT seconds
		//show the updated data
		//enable output
		setInterval(function() {
			timer = TIME_LIMIT;
			updateRound(SOCKET_LIST);
		}, 1000 * TIME_LIMIT);
	};

	var checkPlayers = function(mode) {
		decidedPlayers++;
		if (mode == "waitForPlayers") {
			if (decidedPlayers == totalPlayers) {
				decidedPlayers = 0;
				updateRound(SOCKET_LIST);
			};
		};
	};

	var updateRound = function(sockets) {
		endGame(sockets);
		quarterlyReport(sockets);
		roundNumber++;
		for(var i in sockets) {
			var socket = sockets[i];
			socket.emit('decisionUpdate', {
				playerScore: playerScores[socket.playerNumber],
				groupScore: groupScores[socket.groupNumber],
				teamScore: teamScores[socket.teamNumber],
				world: world
			});
			socket.emit('enable', {});
			socket.emit('nextRound', {
				roundNumber: roundNumber
			});
		};
	};

	var quarterlyReport = function(sockets) {
		if (roundNumber % 3 == 0) {
			quarter++;
			for (var i in sockets) {
				var socket = sockets[i];
				quarterTeamScores = teamScores;
				socket.emit('quarter', {
					teamScores: teamScores,
					groupScores: groupScores
				});
				socket.emit('newQuarter', {
					quarter: quarter
				});
			};
		};
	};

	var endGame = function(sockets) {
		if (world <= 0) {
			for (var i in sockets) {
				var emitSocket = sockets[i];
				emitSocket.emit('worldEnd', {});
			};
		} else if (roundNumber == ROUNDS) {
			for (var i in sockets) {
				var emitSocket = sockets[i];
				emitSocket.emit('worldEnd', {});
			};
		};
	};