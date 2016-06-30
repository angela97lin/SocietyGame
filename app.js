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
	var olympicTeamReward = 10;
	var spaceRaceReward = 10;
	var spaceResearchCost = -2;
	var reliefDonationCost = -1;
	var reliefDonationResult = 1;
	var totalOlympicWinnings = 6;
	var olympicCost = -2;
	var playerScores = {};
	var groupScores = {};
	var teamScores = {};
	var teamNameNumbers = {};
	var teamNumberNames;
	var playerNameToGroup = {};
	var playerNameToTeam = {};
	var currentTeamNumber = 1;
	var investigationLists;
	var numberOfInvestigations = 0;
	var investigationCost = 12;
	var pastActions;
	var teamGroupPlayer = {};
	var usernames = {};
	var usernameData = {};
	var worldEvents = ["World War", "Epidemic", "Olympics", "Natural Disaster", "Space Race"];
	var eventsCompleted = [];
	
	var winningTeams = [];
	var winningNames = [];
	
	var worldEventChance = 0;
	var teamDecisionCounters = {};
	var totalYesVotes = 0;
	var olympicCompetitors = [];
	
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
	var timerPaused = false;

	//variables for waitForPlayers
	var decidedPlayers = 0;

	/*Variables for world war*/
	var individualWarVotes = [];
	var teamSides = [[], []];

	/*Variables for epidemic*/
	var individualBorderVotes = [];


/*LISTENERS*/

	io.sockets.on('connection', function(socket) {

		socket.id = playerNumber;
		SOCKET_LIST[socket.id] = socket;
		console.log('connection made');
		console.log("Socket: " + socket.id);
		playerNumber++;
		socket.emit('indexConnect', {
			numberOfTeams: numberOfTeams, 
			numberOfGroups: numberOfGroups,
			usernames: usernames,
			mode: decisionMode
		});

		socket.on('start', function(data) {
			decisionMode = MODES[data.mode];
			world = data.worldscore;
			totalPlayers = data.numberOfPlayers;
			numberOfGroups = data.numberOfGroups;
			numberOfTeams = data.numberOfTeams;
			numberOfPlayersInGroups = data.numberOfPlayersInGroups;
			numberOfPlayersInTeams = data.numberOfPlayersInTeams;
			for (var i = 1; i <= numberOfTeams; i++) {
				teamGroupPlayer[i] = [];
				for (var j = 0; j < numberOfGroups; j++) {
					teamGroupPlayer[i].push([]);
				};
			};
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
			
			for (i=1; i<=numberOfTeams; i++) {
				teamDecisionCounters[i] = 0;
			}
			
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

		socket.on('decision5', function(data) {
			decision5(socket, data.groupNumber);
		});
		
		socket.on('investigate', function(data) {
			console.log(data.teamInvolved);
			console.log(data.groupInvolved);
			console.log(data.playerToInvestigate);
			console.log(data.playerInvestigating);
			if (data.playerToInvestigate != -1) {
				investigationLists[data.teamInvolved-1][data.groupInvolved-1][data.playerToInvestigate-1].push(data.playerInvestigating);
			};
			numberOfInvestigations += 1;
			if(numberOfInvestigations == totalPlayers){
				carryOutInvestigations(SOCKET_LIST);
				numberOfInvestigations = 0;
				enableAllButtons(SOCKET_LIST);
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
			if (data.username in usernameData) {
				var userData = usernameData[data.username];
				socket.rawGroupNumber = userData.rawGroupNumber;
				socket.teamNumber = userData.teamNumber;
				socket.username = data.username;
				socket.playerNumber = userData.playerNumber;
				socket.groupNumber = userData.groupNumber;
				socket.playerNumberInGroup = userData.playerNumberInGroup;
			} else {
				socket.rawGroupNumber = data.groupNumberInput;
				socket.teamNumber = data.teamNumber;
				socket.username = data.username;
				numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] += 1;
				console.log(numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1]);
				console.log(socket.rawGroupNumber);
				console.log(numberOfPlayersInGroups);
				console.log(socket.teamNumber);
				console.log(numberOfPlayersInTeams);
				// socket.playerNumber = data.playerNumber + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
				// socket.rawPlayerNumber = data.playerNumber;
				socket.playerNumber = numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
				console.log("Player Number: " + socket.playerNumber);
				//socket.playerNumberInGroup = data.playerNumber;
				usernames[socket.playerNumber] = data.username;
				if (!(socket.playerNumber in playerScores)){
					playerScores[socket.playerNumber] = 20;
				};
				if (!(socket.teamNumber in teamScores)){
					teamScores[socket.teamNumber] = 20 * numberOfGroups;
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
				playerNameToGroup[data.username] = data.groupNumberInput;
				playerNameToTeam[data.username] = data.teamNumber;
				teamGroupPlayer[socket.teamNumber][data.groupNumberInput - 1].push(socket.playerNumber);
				socket.playerNumberInGroup = teamGroupPlayer[socket.teamNumber][data.groupNumberInput - 1].indexOf(socket.playerNumber) + 1;
				socket.emit('player', {
					number: socket.playerNumberInGroup,
				});
				if (!(socket.teamNumber in teamScores)){
					teamScores[socket.teamNumber] = 20 * numberOfGroups;
				};
				if (!(socket.groupNumber in groupScores)){
					groupScores[socket.groupNumber] = 20;
				};
				usernameData[data.username] = {rawGroupNumber: socket.rawGroupNumber,
											   teamNumber: socket.teamNumber,
											   username: socket.username,
											   playerNumber: socket.playerNumber,
											   groupNumber: socket.groupNumber,
											   playerNumberInGroup: socket.playerNumberInGroup};
			};
			usernames[socket.playerNumber] = data.username;
			socket.emit("team", {
				team: teamScores[socket.teamNumber]
			});
			socket.emit("world", {
				world: world
			});
			if (decisionMode == "timer") {
				socket.emit("timer", {
					timer: timeLimitToString(timerMinutes, timerSeconds)
				});
			};
			socket.emit("player", {
				number: socket.playerNumberInGroup,
				playerScore: playerScores[socket.playerNumber]
			});
			socket.emit('getTeamNumber', {
				teamNameNumbers: teamNameNumbers,
				groupNumber: socket.groupNumber
			});
			socket.emit('team', {
				team: teamScores[socket.teamNumber]
			});
			socket.emit('teamInitiate', {
				playersPerGroup: numberOfPlayersInGroups,
				p: socket.playerNumberInGroup
			});
			socket.emit("getRound", {
				roundNumber: roundNumber
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

		/*Listeners for world war*/
		socket.on("castWarVote", function(data) {
			individualWarVotes[data.team - 1][data.side] += 1;
			checkWarVotes(data.team, data.side);
			checkTeamSides();
		});

		/*Listeners for epidemic*/
		socket.on("castBorderVote", function(data) {
			individualBorderVotes[data.team - 1][data.side] += 1;
			checkBorderVotes(data.team, data.side);
			checkBorderSides();
		});

		socket.on('beginGame', function() {
			setInterval(function() {
				if (decidedPlayers == totalPlayers) {
					decidedPlayers = 0;
					timerMinutes = TIME_LIMIT_MINUTES;
					timerSeconds = TIME_LIMIT_SECONDS;
					updateRound(SOCKET_LIST);
					
				};
			
				if (timerMinutes == 0 && timerSeconds == 0) {
					timerMinutes = TIME_LIMIT_MINUTES;
					timerSeconds = TIME_LIMIT_SECONDS;
					decidedPlayers = 0;
					updateRound(SOCKET_LIST);
				};
				
				for(var i in SOCKET_LIST) {
					var socket = SOCKET_LIST[i];
					socket.emit("enable", {});
					socket.emit('timer', {
						timer: timeLimitToString(timerMinutes, timerSeconds)
					});
				};
				
				if (!timerPaused) {
					if (timerSeconds == 0) {
						timerSeconds = 59
						timerMinutes--;
					} else {
						timerSeconds--;
					};
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
				winningNames: winningNames,
				playerNameToTeam: playerNameToTeam,
				playerNameToGroup: playerNameToGroup
			});
		});

		socket.on('disconnect', function() {
			delete usernames[socket.playerNumber];
			console.log("Player " + socket.playerNumber + " has been disconnected");
		});
		
		socket.on('competeInOlympics', function() {
			olympicCompetitors.push(socket.playerNumber);
			decidedPlayers += 1;
			if (decidedPlayers == totalPlayers) {
				carryOutOlympics();
				decidedPlayers = 0;
				olympicCompetitors = [];
			}
		});
		
		socket.on('sendRelief', function() {
			teamDecisionCounters[socket.teamNumber] += 1;
			totalYesVotes += 1;
			decidedPlayers += 1;
			if (decidedPlayers == totalPlayers) {
				carryOutRelief();
				decidedPlayers = 0;
				totalYesVotes = 0;
				for (i=1; i<=numberOfTeams; i++) {
					teamDecisionCounters[i] = 0;
				}
			}
		});
		
		socket.on('donateToSpaceRace', function() {
			teamDecisionCounters[socket.teamNumber] += 1;
			playerScores[socket.playerNumber] += spaceResearchCost;
			decidedPlayers += 1;
			if (decidedPlayers == totalPlayers) {
				carryOutSpaceRace();
				decidedPlayers = 0;
				for (i=1; i<=numberOfTeams; i++) {
					teamDecisionCounters[i] = 0;
				}
			}
		});
		
		socket.on('doNothing', function(data) {
			decidedPlayers += 1;
			if (decidedPlayers == totalPlayers) {
				if (data.eventNumber == 2) {
					carryOutOlympics();
				}
				else if (data.eventNumber == 3) {
					carryOutRelief();
				}
				else if (data.eventNumber == 4) {
					carryOutSpaceRace();
				}
				decidedPlayers = 0;
				totalYesVotes = 0;
				olympicCompetitors = [];
				for (i=1; i<=numberOfTeams; i++) {
					teamDecisionCounters[i] = 0;
				}
			}
		});

	});


/*FUNCTIONS*/

	var pauseTimer = function() {
		timerPaused = true;
	};
	
	var unpauseTimer = function() {
		timerPaused = false;
	};

	var carryOutOlympics = function() {
		bestPlayers = [];
		bestScoreSoFar = 0;
		secondBestScoreSoFar = 0;
		thirdBestScoreSoFar = 0;
		
		for (i=0; i<olympicCompetitors.length; i++) {
			playerScores[olympicCompetitors[i]] += olympicCost;
			thisPlayersScore = playerScores[olympicCompetitors[i]];
			if (thisPlayersScore >= bestScoreSoFar) {
				thirdBestScoreSoFar = secondBestScoreSoFar;
				secondBestScoreSoFar = bestScoreSoFar;
				bestScoreSoFar = thisPlayersScore;
			}
			else if (thisPlayersScore >= secondBestScoreSoFar) {
				thirdBestScoreSoFar = secondBestScoreSoFar;
				secondBestScoreSoFar = thisPlayersScore;
			}
			else if (thisPlayersScore >= thirdBestScoreSoFar) {
				thirdBestScoreSoFar = thisPlayersScore;
			}
		};
		
		for (i=0; i<olympicCompetitors.length; i++) {
			thisPlayersScore = playerScores[olympicCompetitors[i]];
			if (thisPlayersScore >= thirdBestScoreSoFar) {
				bestPlayers.push(olympicCompetitors[i]);
			}
		};
		for (i=0; i<bestPlayers.length; i++) {
			playerScores[bestPlayers[i]] += -(olympicCost);
			playerScores[bestPlayers[i]] += Math.ceil((totalOlympicWinnings*1.0) / bestPlayers.length);
			teamScores[playerNameToTeam[usernames[bestPlayers[i]]]] += olympicTeamReward;
		};
		bestScoreSoFar = 0;
		secondBestScoreSoFar = 0;
		thirdBestScoreSoFar = 0;
		scoreUpdate(SOCKET_LIST);
		eventOver();
	};

	var carryOutRelief = function() {
		for (i=1; i<=numberOfTeams; i++) {
			teamScores[i] += (teamDecisionCounters[i] * reliefDonationCost);
			world += (teamDecisionCounters[i] * reliefDonationResult);
		};
		scoreUpdate(SOCKET_LIST);
		eventOver();
	}

	var carryOutSpaceRace = function() {
		highestTeam = [];
		bestScoreSoFar = 0;
		for (i=1; i<=numberOfTeams; i++) {
			if (teamDecisionCounters[i] > bestScoreSoFar) {
				bestScoreSoFar = teamDecisionCounters[i];
				highestTeam = [i];
			}
			else if (teamDecisionCounters[i] == bestScoreSoFar) {
				highestTeam.push[i];
			}
		};
		for (i=0; i<highestTeam.length; i++) {
			teamScores[highestTeam[i]] += (spaceRaceReward/highestTeam.length);
		}
		bestScoreSoFar = 0;
		scoreUpdate(SOCKET_LIST);
		eventOver();
	};

	var checkWorldEvents = function() {
		startWorldEvent(worldEventNumber);
	};
	
	var startWorldEvent = function(worldEventNumber) {
	
	};

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
			socket.emit('nextRound', {
				roundNumber: roundNumber
			});
		}
		unpauseTimer();
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
	};
	
	var enableAllButtons = function(sockets) {
		for(var i in sockets) {
			var socket = sockets[i];
			socket.emit('enable', {});
		};
	};
	
	var scoreUpdate = function(sockets) {
		for(var i in sockets) {
			var socket = sockets[i];
			socket.emit('decisionUpdate', {
				playerScore: playerScores[socket.playerNumber],
				groupScore: groupScores[socket.groupNumber],
				teamScore: teamScores[socket.teamNumber],
				world: world
			});
			socket.emit('enable', {});
		};
	};

	var updateRound = function(sockets) {
		endGame(sockets);
		for(var i in sockets) {
			var socket = sockets[i];
			socket.emit('decisionUpdate', {
				playerScore: playerScores[socket.playerNumber],
				groupScore: groupScores[socket.groupNumber],
				teamScore: teamScores[socket.teamNumber],
				world: world
			});
			if (roundNumber != 12) {
				socket.emit('enable', {});
				socket.emit('nextRound', {
					roundNumber: roundNumber + 1
				});
			};
		};
		pauseTimer();
		getWorldEvent();
		unpauseTimer();
		pauseTimer();
		quarterlyReport(sockets);
		roundNumber++;
	};

	var quarterlyReport = function(sockets) {
		worldEventChance += 1;
		if (roundNumber < 3 || roundNumber == 5 || roundNumber == 8 || roundNumber == 11) {
			worldEventChance = 0;
		}
		if (roundNumber % 3 == 0 && roundNumber != 12) {
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
				socket.emit('nextRound', {
					roundNumber: "Investigations"
				});
			};
			worldEventChance = 1;
		}
		else {
			unpauseTimer();
		};
		//updateRound(SOCKET_LIST);
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
				if (overallWinners.indexOf(emitSocket.playerNumber) >= 0) {
					emitSocket.emit('win', {});
				} else if (teamWinners.indexOf(emitSocket.playerNumber) >= 0) {
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

	function decision5(socket, groupNumber) {
		if (groupNumber == 1) {
			world += 1;
			groupScores[socket.groupNumber] += 1;
			teamScores[socket.teamNumber] += 1;
			playerScores[socket.playerNumber] -= 1;
		} else if (groupNumber == 2) {
			world += 1;
			groupScores[socket.groupNumber] -= 2;
			teamScores[socket.teamNumber] -= 2;
			playerScores[socket.playerNumber] += 1;
		} else if (groupNumber == 3) {
			world += 2;
			groupScores[socket.groupNumber] -= 1;
			teamScores[socket.teamNumber] -= 1;
		} else if (groupNumber == 4) {
			world -= 2;
			groupScores[socket.groupNumber] -= 1;
			teamScores[socket.teamNumber] -= 1;
			playerScores[socket.playerNumber] += 2;
		};
		checkPlayers(decisionMode);
		pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(5);
	};
	
	function getRandomZeroToFour() {
		randomOneToTen = Math.floor((Math.random() * 10) + 1);
		randomZeroToFour = randomOneToTen % 5;
		return randomZeroToFour;
	};
	
	function getRandomZeroToThree() {
		randomZeroToThree = Math.floor(Math.random() * 4);
		return randomZeroToThree;
	};
	
	function getRandomZeroToTwo() {
		randomZeroToTwo = Math.floor(Math.random() * 3);
		return randomZeroToTwo;
	};
	
	function getWorldEvent() {
		eventUsed = false;
		chosenEvent = getRandomZeroToFour();
		for (i=0; i<eventsCompleted.length; i++) {
			if (eventsCompleted[i] == chosenEvent) {
				eventUsed = true;
			}
		};
		while (eventUsed) {
			eventUsed = false;
			chosenEvent = getRandomZeroToFour();
			for (i=0; i<eventsCompleted.length; i++) {
				if (eventsCompleted[i] == chosenEvent) {
					eventUsed = true;
				}
			};
		};
		if (worldEventChance == 1) {
			if (Math.random() <= .333) {
				carryOutWorldEvent(worldEvents[chosenEvent], chosenEvent);
				worldEventChance = -1;
			}
			else {
				unpauseTimer();
			}
		}
		else if (worldEventChance == 2) {
			if (Math.random() <= .666) {
				carryOutWorldEvent(worldEvents[chosenEvent], chosenEvent);
			}
			else {
				unpauseTimer();
			}
		}
	};
	
	function carryOutWorldEvent(worldEvent, chosenEvent) {
		eventsCompleted.push(chosenEvent);
		var teamInLead;
		if (chosenEvent == 0) {
			var topScore = Number.NEGATIVE_INFINITY;
			for (var i = 0; i < numberOfTeams; i++) {
				if (teamScores[i + 1] > topScore) {
					topScore = teamScores[i + 1];
					teamInLead = i + 1;
				};
				individualWarVotes[i] = [0, 0];
			};
			teamSides[0].push(teamInLead);
			decidedPlayers += 1;
			checkTeamSides();
		} else if (chosenEvent == 1) {
			for (var i = 0; i < numberOfTeams; i++) {
				individualBorderVotes[i] = [0, 0];
			};
		};
		for (var i in SOCKET_LIST) {
			var socket = SOCKET_LIST[i];
			socket.emit('worldEvent', {
				eventNumber: chosenEvent,
				teamScores: teamScores,
				groupScores: groupScores,
				teamInLead: teamInLead
			});
			socket.emit('nextRound', {
				roundNumber: "World Event"
			});
		};
	};

	function checkWarVotes(team, side) {
		var THRESHOLD = .5;
		var currentPercentFor = individualWarVotes[team - 1][side] / numberOfPlayersInTeams;
		if (currentPercentFor >= THRESHOLD) {
			teamSides[side].push(team);
		};
		decidedPlayers += 1;
	};

	function checkTeamSides() {
		if (decidedPlayers == totalPlayers) {
			var WINNING_BONUS = 12;
			var groupBonus = WINNING_BONUS / numberOfGroups;
			var team0Score = 0;
			var team1Score = 0;
			for (var i = 0; i < teamSides[0].length; i++) {
				team0Score += teamScores[teamSides[0][i]];
			};
			for (var i = 0; i < teamSides[1].length; i++) {
				team1Score += teamScores[teamSides[1][i]];
			};
			if (team0Score > team1Score) {
				for (var i = 0; i < teamSides[0].length; i++) {
					teamScores[teamSides[0][i]] += WINNING_BONUS;
					for (var j = 1; j <= numberOfGroups; j++) {
						groupScores[[teamSides[0][i], j]] += groupBonus;
					};
				};
			} else {
				for (var i = 0; i < teamSides[1].length; i++) {
					teamScores[teamSides[1][i]] += WINNING_BONUS;
					for (var j = 1; j <= numberOfGroups; j++) {
						groupScores[[teamSides[1][i], j]] += groupBonus;
					};
				};
			};
			eventOver();
			decidedPlayers = 0;
			scoreUpdate(SOCKET_LIST);
			unpauseTimer();
			for (var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.emit('nextRound', {
					roundNumber: roundNumber
				});
			};
 		};
	};

	function checkBorderVotes(team, side) {
		var THRESHOLD = .5;
		var TEAM_BONUS = 12;
		var WORLD_BONUS = 20;
		var groupBonus = TEAM_BONUS / numberOfGroups;
		var currentPercentFor = individualBorderVotes[team - 1][side] / numberOfPlayersInTeams;
		if (currentPercentFor >= THRESHOLD) {
			if (side == 0) {
				world -= WORLD_BONUS;
				teamScores[team] += TEAM_BONUS;
				for (var j = 1; j <= numberOfGroups; j++) {
					groupScores[[team, j]] += groupBonus;
				};
			} else {
				world += WORLD_BONUS;
				teamScores[team] -= TEAM_BONUS;
				for (var j = 1; j <= numberOfGroups; j++) {
					groupScores[[team, j]] -= groupBonus;
				};
			};
		};
		decidedPlayers += 1;
	};

	function checkBorderSides() {
		if (decidedPlayers == totalPlayers) {
			eventOver();
			decidedPlayers = 0;
			scoreUpdate(SOCKET_LIST);
			unpauseTimer();
			for (var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.emit('nextRound', {
					roundNumber: roundNumber
				});
			};
		};
	};
	
	function eventOver() {
		for (var i in SOCKET_LIST) {
			var socket = SOCKET_LIST[i];
			socket.emit('eventOver', {});
			socket.emit('nextRound', {
				roundNumber: roundNumber
			});
		};
		unpauseTimer();
	};