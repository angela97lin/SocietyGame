/*INITIALIZATION*/

	var express = require('express');
	var app = express();
	var serv = require('http').createServer(app);
	serv.listen(3000, "0.0.0.0");
	console.log('server started');
	var SOCKET_LIST = {};
	var io = require('socket.io')(serv, {});
	
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/client/Planetarium_Rules.html');
	});
	app.get('/index', function(req, res) {
		res.sendFile(__dirname + '/client/index.html');
	});
	app.get('/main', function(req, res) {
		res.sendFile(__dirname + '/client/main_host.html');
	});
	app.get('/worldend', function(req, res) {
		res.sendFile(__dirname + '/client/worldend.html');
	});
	app.get('/win', function(req, res) {
		res.sendFile(__dirname + '/client/win.html');
	});
	app.get('/winningteam', function(req, res) {
		res.sendFile(__dirname + '/client/winningteam.html');
	});
	app.get('/lose', function(req, res) {
		res.sendFile(__dirname + '/client/lose.html');
	});
	app.get('/congratulations', function(req, res) {
		res.sendFile(__dirname + '/client/congratulations.html');
	});
	app.use('/client', express.static(__dirname + '/client'));

	var playerNumber = 1;
	var totalPlayers;
	var numberOfPlayersInGroups;
	var numberOfGroups;
	var numberOfTeams;
	var numberOfPlayersInTeams;
	var world;
	var roundNumber = 1;
	var quarter = 0;
	var ROUNDS = 12;
	var playerScores = {};
	var groupScores = {};
	var teamScores = {};
	var teamNameNumbers = {};
	var teamNumberNames;
	var currentTeamNumber = 1;
	var investigationLists;
	var numberOfInvestigations = 0;
	var investigationCost = 12;
	var pastActions;
	var teamGroupPlayer = {};
	var usernames = {};

	var winningTeams = [];
	var winningNames = [];
	
	var numberOfPlayersConnectedPerGroup = [];

	//decide whether a round is over based on the timer or once all players have made a decision
	//either timer or waitForPlayers
	var MODES = {1: "timer",
				 2: "waitForPlayers"};
	var decisionMode;
	
	//variables for timer
	var TIME_LIMIT_MINUTES;
	var TIME_LIMIT_SECONDS;
	var timerMinutes;
	var timerSeconds;

	//variables for waitForPlayers
	var decidedPlayers = 0;


/*LISTENERS*/

	io.sockets.on('connection', function(socket) {

		socket.id = playerNumber;
		SOCKET_LIST[socket.id] = socket;
		console.log('connection made');
		console.log("Socket: " + socket.id);
		playerNumber++;
		socket.emit('indexConnect', {
			numberOfTeams: numberOfTeams, 
			numberOfGroups: numberOfGroups
		});

		socket.on('start', function(data) {
			decisionMode = MODES[data.mode];
			world = data.numberOfTeams * 10;
			totalPlayers = data.numberOfPlayers;
			numberOfGroups = data.numberOfGroups;
			numberOfTeams = data.numberOfTeams;
			numberOfPlayersInGroups = data.numberOfPlayersInGroups;
			numberOfPlayersInTeams = data.numberOfPlayersInTeams;
			for (var i = 1; i <= numberOfTeams; i++) {
				teamGroupPlayer[i] = [];
			};
			for (var i = 1; i <= numberOfTeams; i++) {
				for (var j = 0; j < numberOfGroups; j++) {
					teamGroupPlayer[i].push([]);
				};
			};
			console.log("teamGroupPlayer:" + teamGroupPlayer);
			if (decisionMode == "timer") {
				TIME_LIMIT_MINUTES = data.minutes;
				TIME_LIMIT_SECONDS = data.seconds;
				timerMinutes = TIME_LIMIT_MINUTES;
				timerSeconds = TIME_LIMIT_SECONDS;
				socket.emit('startTimer', {
					timer: timeLimitToString(timerMinutes, timerSeconds)
				});
			};
			investigationLists = [];
			for(i=1; i<=numberOfTeams; i++){
				thisTeam = [];
				for(j=1; j<=numberOfGroups; j++){
					thisGroup = [];
					for(k=1; k<=numberOfPlayersInGroups; k++){
						thisPlayer = [];
						thisGroup.push(thisPlayer);
					};
					thisTeam.push(thisGroup);
				};
				investigationLists.push(thisTeam);
			};
			
			pastActions = [];
			for(i=1; i<=numberOfTeams; i++){
				thisTeam = [];
				for(j=1; j<=numberOfGroups; j++){
					thisGroup = [];
					for(k=1; k<=numberOfPlayersInGroups; k++){
						thisPlayer = [];
						thisGroup.push(thisPlayer);
					};
					thisTeam.push(thisGroup);
				};
				pastActions.push(thisTeam);
			};
			console.log(pastActions);
			for (i=0;i<numberOfTeams;i++) {
				teamToAdd = [];
				for (j=0;j<numberOfGroups;j++) {
					teamToAdd.push(0);
				}
				numberOfPlayersConnectedPerGroup.push(teamToAdd);
			}
		});
		
		socket.on('decision1', function(data) {
			world += -1;
			groupScores[socket.groupNumber] += -2;
			teamScores[socket.teamNumber] += -2;
			playerScores[socket.playerNumber] += 2;
			checkPlayers(decisionMode);
			console.log(pastActions);
			console.log(socket.teamNumber);
			console.log(socket.rawGroupNumber);
			console.log(socket.playerNumberInGroup);
			console.log(teamGroupPlayer);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(1);
		});

		socket.on('decision2', function(data) {
			world += 0;
			groupScores[socket.groupNumber] += 2;
			teamScores[socket.teamNumber] += 2;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(2);
		});
		
		socket.on('decision3', function(data) {
			world += -1;
			groupScores[socket.groupNumber] += 1;
			teamScores[socket.teamNumber] += 1;
			playerScores[socket.playerNumber] += 1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(3);
		});

		socket.on('decision4', function(data) {
			world += 2;
			groupScores[socket.groupNumber] += 0;
			teamScores[socket.teamNumber] += 0;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(4);
		});
		
		socket.on('investigate', function(data) {
			console.log(data.teamInvolved);
			console.log(data.groupInvolved);
			console.log(data.playerToInvestigate);
			console.log(data.playerInvestigating);
			investigationLists[data.teamInvolved-1][data.groupInvolved-1][data.playerToInvestigate-1].push(data.playerInvestigating);
			numberOfInvestigations += 1;
			if(numberOfInvestigations == totalPlayers){
				carryOutInvestigations(SOCKET_LIST);
				numberOfInvestigations = 0;
				investigationLists = []
				for(i=1; i<=numberOfTeams; i++){
					thisTeam = [];
					for(j=1; j<=numberOfGroups; j++){
						thisGroup = [];
						for(k=1; k<=numberOfPlayersInGroups; k++){
							thisPlayer = [];
							thisGroup.push(thisPlayer);
						};
						thisTeam.push(thisGroup);
					};
					investigationLists.push(thisTeam);
				};
			};
		});

		socket.on('playerConnect', function(data) {
			socket.rawGroupNumber = data.groupNumberInput;
			socket.teamNumber = data.teamNumber;
			numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] += 1;
			console.log(numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1]);
			console.log(socket.rawGroupNumber);
			console.log(numberOfPlayersInGroups);
			console.log(socket.teamNumber);
			console.log(numberOfPlayersInTeams);
			console.log("teamGroupPlayer: " + teamGroupPlayer);
			// socket.playerNumber = data.playerNumber + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
			// socket.rawPlayerNumber = data.playerNumber;
			socket.playerNumber = numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
			//socket.playerNumberInGroup = data.playerNumber;
			console.log(socket.playerNumber);
			usernames[socket.playerNumber] = data.username;
			if (!(socket.playerNumber in playerScores)){
				playerScores[socket.playerNumber] = 20;
			};
			if (!(socket.teamNumber in teamScores)){
				teamScores[socket.teamNumber] = 20 * numberOfGroups;
			};
			socket.emit('team', {
				team: teamScores[socket.teamNumber] 
			});

			socket.emit('world', {
				world: world
			});
			if (decisionMode == "timer") {
				socket.emit('timer', {
					timer: timeLimitToString(timerMinutes, timerSeconds)
				});
			};

			//associate team names and numbers
			if (!(data.teamName in teamNameNumbers)) {
				teamNameNumbers[data.teamName] = currentTeamNumber;
				for (var i in SOCKET_LIST) {
					var emitSocket = SOCKET_LIST[i];
					emitSocket.emit('newTeam', {
						teamName: data.teamName,
						currentTeamNumber: currentTeamNumber
					});
				};
				currentTeamNumber++;
			};
			//socket.teamNumber = teamNameNumbers[data.teamName];
			socket.groupNumber = [socket.teamNumber, data.groupNumberInput];
			teamGroupPlayer[socket.teamNumber][data.groupNumberInput - 1].push(socket.playerNumber);
			socket.playerNumberInGroup = teamGroupPlayer[socket.teamNumber][data.groupNumberInput - 1].indexOf(socket.playerNumber) + 1;
			socket.emit('player', {
				number: socket.playerNumberInGroup
			});
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
			socket.emit('player', {
				number: socket.playerNumberInGroup
			});
			socket.emit('team', {
				team: teamScores[socket.teamNumber] 
			});
			socket.emit('world', {
				world: world
			});
			if (decisionMode == 'timer') {
				socket.emit('timer', {
					timer: timeLimitToString(timerMinutes, timerSeconds)
				});
			};
			socket.emit('decisionUpdate', {
				playerScore: playerScores[socket.playerNumber],
				groupScore: groupScores[socket.groupNumber],
				teamScore: teamScores[socket.teamNumber],
				world: world
			});
		});

		socket.on('beginGame', function() {
			setInterval(function() {
				if (timerMinutes == 0 && timerSeconds == 0) {
					timerMinutes = TIME_LIMIT_MINUTES;
					timerSeconds = TIME_LIMIT_SECONDS;
					updateRound(SOCKET_LIST);
				};
				for(var i in SOCKET_LIST) {
					var socket = SOCKET_LIST[i];
					socket.emit('timer', {
						timer: timeLimitToString(timerMinutes, timerSeconds)
					});
				};
				if (timerSeconds == 0) {
					timerSeconds = 59
					timerMinutes--;
				} else {
					timerSeconds--;
				};
			}, 1000);
		});

		socket.on('getTeamNames', function(data) {
			teamNumberNames = data.teamNumberNames;
		});

		socket.on('congratulations', function() {
			socket.emit('mainWinners', {
				teamNumberNames: teamNumberNames,
				winningTeams: winningTeams,
				winningNames: winningNames
			});
		});
	});


/*FUNCTIONS*/

	var carryOutInvestigations = function(sockets) {
		var teamCount = 0;
		console.log(pastActions);
		for (i=0;i<pastActions.length;i++) {
			console.log(pastActions[i]);
			teamCount += 1;
			groupCount = 0;
			for (j=0;j<pastActions[i].length;j++) {
				console.log(pastActions[i][j]);
				groupCount += 1;
				playerCount = 0;
				for (k=0;k<pastActions[i][j].length;k++) {
					console.log(pastActions[i][j][k]);
					playerCount += 1;
					var counter = 0;
					for (l=0;l<pastActions[i][j][k].length;l++) {
						console.log("ACTION: " + pastActions[i][j][k][l]);
						if (pastActions[i][j][k][l] == 1) {
							counter += 1;
						}
					}
					if (counter == 0) {
						console.log("Team: " + teamCount);
						console.log("Group: " + groupCount);
						console.log("Player: " + playerCount);
						console.log(investigationLists);
						console.log(investigationLists[i]);
						console.log(investigationLists[i][j]);
						console.log(investigationLists[i][j][k]);
						for (m=0;m<investigationLists[i][j][k].length;m++) {
							playerToLosePointsNumber = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + parseInt(investigationLists[i][j][k][m], 10);
							console.log("PTLPN: " + playerToLosePointsNumber);
							console.log("i: " + i);
							console.log("j: " + j);
							console.log("k: " + k);
							console.log("m: " + m);
							console.log(playerScores)
							console.log(playerScores[playerToLosePointsNumber]);
							playerScores[playerToLosePointsNumber] += -((investigationCost)/(investigationLists[i][j][k].length));
							console.log(playerScores[playerToLosePointsNumber]);
						}
					}
					else {
						for (m=0;m<investigationLists[i][j][k].length;m++) {
							playerCaught = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + k + 1;
							playerToGainPointsNumber = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + parseInt(investigationLists[i][j][k][m], 10);
							console.log("PC: " + playerCaught);
							console.log(playerScores[playerCaught]);
							playerScores[playerCaught] += (-2 * counter);
							console.log(playerScores[playerCaught]);
							console.log("PTGPN: " + playerToGainPointsNumber);
							console.log(playerScores[playerToGainPointsNumber]);
							playerScores[playerToGainPointsNumber] += ((2*counter)/(investigationLists[i][j][k].length));
							console.log(playerScores[playerToGainPointsNumber]);
						}
					}
				}
			}
		};
		pastActions = [];
		for(i=1; i<=numberOfTeams; i++){
			thisTeam = [];
			for(j=1; j<=numberOfGroups; j++){
				thisGroup = [];
				for(k=1; k<=numberOfPlayersInGroups; k++){
					thisPlayer = [];
					thisGroup.push(thisPlayer);
				};
				thisTeam.push(thisGroup);
			};
			pastActions.push(thisTeam);
		};
		for(var i in sockets) {
			var socket = sockets[i];
			socket.emit('investigationOver', {});
		}
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
	
	var updatePastActions = function(socket, decision){
		pastActions[socket.teamNumber-1][socket.groupNumber-1][socket.playerNumber-1].push(decision);
	}

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
				console.log("New Quarter");
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
			//find the winning teams
			//will only be more than one if there is a tie
			var winningTeamScore = Number.NEGATIVE_INFINITY;
			for (var team in teamGroupPlayer) {
				winningTeamScore = Math.max(winningTeamScore, teamScores[team]);
			};
			for (var team in teamGroupPlayer) {
				if (teamScores[team] == winningTeamScore) {
					winningTeams.push(team);
				};
			};
			//find the players with the highest score in each group
			var overallWinners = [];
			var teamWinners = [];
			for (var i = 0; i < winningTeams.length; i++) {
				var team = teamGroupPlayer[winningTeams[i]];
				for (var j = 0; j < team.length; j++) {
					var group = team[j];
					winningPlayerScore = Number.NEGATIVE_INFINITY;
					for (var k = 0; k < group.length; k++) {
						var player = group[k];
						teamWinners.push(player);
						winningPlayerScore = Math.max(winningPlayerScore, playerScores[player]);
					};
					for (var k = 0; k < group.length; k++) {
						var player = group[k];
						if (playerScores[player] == winningPlayerScore) {
							overallWinners.push(player);
						};
					};
				};
			};
			for (var i = 0; i < overallWinners.length; i++) {
				winningNames.push(usernames[overallWinners[i]]);
			};
			console.log("winning teams: " + winningTeams);
			console.log("overall winners: " + overallWinners);
			console.log("team winners: " + teamWinners);
			for (var i in sockets) {
				var emitSocket = sockets[i];
				if (overallWinners.indexOf(emitSocket.id) >= 0) {
					emitSocket.emit('win', {});
				} else if (teamWinners.indexOf(emitSocket.id) >= 0) {
					emitSocket.emit('teamWin', {});
				} else {
					emitSocket.emit('lose', {});
					emitSocket.emit('mainWinners', {});
				};
			};
		};
	};

	function timeLimitToString(minutes, seconds) {
		if (seconds < 10) {
			return minutes.toString() + ":0" + seconds.toString();
		} else {
			return minutes.toString() + ":" + seconds.toString();
		};
	};