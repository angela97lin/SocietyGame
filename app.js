/*INITIALIZATION*/

	var express = require('express');
	var app = express();
	var serv = require('http').createServer(app);
	serv.listen(3000, "0.0.0.0");
	console.log('server started');
	var SOCKET_LIST = {};
	var io = require('socket.io')(serv, {});
	var mainConnected = false;
	
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
	app.get('/game_over', function(req, res) {
		res.sendFile(__dirname + '/client/game_over.html');
	});
	app.get('/gamemaster', function(req, res) {
		res.sendFile(__dirname + '/client/gamemaster.html');
	});
	app.use('/client', express.static(__dirname + '/client'));

	var playerNumber = 1;
	var totalPlayers;
	var numberOfPlayersInGroups;
	var numberOfGroups;
	var numberOfTeams;
	var numberOfPlayersInTeams;
	var world;
	var NATIONS;
	var GROUP_NAMES;
	var roundNumber = 1;
	var quarter = 0;
	var ROUNDS = 12;
	var afterRoundDelayAmount = 3;
	
	var olympicTeamReward = 6;
	var spaceRaceReward = 10;
	var spaceResearchCost = -2;
	var reliefDonationCost = -1;
	var reliefDonationResult = 1;
	var totalOlympicWinnings = 3;
	var olympicCost = -2;
	var THRESHOLD = .5;
	var BORDER_TEAM_BONUS = 4;
	var BORDER_WORLD_BONUS = 6;
	var WAR_WINNING_BONUS = 6;
	var teamInLead;
	
	var playerScores = {};
	var groupScores = {};
	var teamScores = {};
	var teamNameNumbers = {};
	var playerNameToGroup = {};
	var playerNameToTeam = {};
	var playerNameToNumber = {};
	var currentTeamNumber = 1;
	var investigationLists;
	var numberOfInvestigations = 0;
	var investigationCost = 12;
	var pastActions;
	var teamGroupPlayer = {};
	var usernames = {};
	var usernameData = {};
	var groupmatesDict = {};
	var worldEvents = ["World War", "Epidemic", "Olympics", "Natural Disaster", "Space Race"];
	var eventsCompleted = [];
	
	var winningTeams = [];
	var winningNames = [];
	
	var worldEventChance = 0;
	var teamDecisionCounters = {};
	var totalYesVotes = 0;
	var olympicCompetitors = [];
	
	var numberOfPlayersConnectedPerGroup = [];
	
	var gameStateScreenType = "decision";
	var playerDecisionMade = {};
	var mostRecentWorldEvent = -1;

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
	var borderSides = [[], []];
	
	var hasStarted = false;


/*LISTENERS*/

	io.sockets.on('connection', function(socket) {

		socket.id = playerNumber;
		SOCKET_LIST[socket.id] = socket;
		playerNumber++;
		if (mainConnected) {
			socket.emit('indexConnect', {
				numberOfTeams: numberOfTeams, 
				numberOfGroups: numberOfGroups,
				usernames: usernames,
				mode: decisionMode,
				usernameData: usernameData
			});
		};

		socket.on('start', function(data) {
			decisionMode = MODES[data.mode];
			NATIONS = data.NATIONS;
			GROUP_NAMES = data.GROUP_NAMES;
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
			
			for (i=0;i<numberOfTeams;i++) {
				teamToAdd = [];
				for (j=0;j<numberOfGroups;j++) {
					teamToAdd.push(0);
				}
				numberOfPlayersConnectedPerGroup.push(teamToAdd);
			};
			mainConnected = true;
			resetPlayerDecisionMade();
		});
		
		socket.on('decision1', function(data) {
			world += -1;
			playerDecisionMade[socket.playerNumber] = 1;
			groupScores[socket.groupNumber] += -2;
			teamScores[socket.teamNumber] += -2;
			playerScores[socket.playerNumber] += 2;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(1);
		});

		socket.on('decision2', function(data) {
			playerDecisionMade[socket.playerNumber] = 2;
			world += 0;
			groupScores[socket.groupNumber] += 2;
			teamScores[socket.teamNumber] += 2;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(2);
		});
		
		socket.on('decision3', function(data) {
			playerDecisionMade[socket.playerNumber] = 3;
			world += -1;
			groupScores[socket.groupNumber] += 1;
			teamScores[socket.teamNumber] += 1;
			playerScores[socket.playerNumber] += 1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(3);
		});

		socket.on('decision4', function(data) {
			playerDecisionMade[socket.playerNumber] = 4;
			world += 2;
			groupScores[socket.groupNumber] += 0;
			teamScores[socket.teamNumber] += 0;
			playerScores[socket.playerNumber] += -1;
			checkPlayers(decisionMode);
			pastActions[socket.teamNumber-1][socket.rawGroupNumber-1][socket.playerNumberInGroup-1].push(4);
		});

		socket.on('decision5', function(data) {
			playerDecisionMade[socket.playerNumber] = 5;
			decision5(socket, data.groupNumber);
		});
		
		socket.on('investigate', function(data) {
			playerDecisionMade[socket.playerNumber] = 0;
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
			console.log(data.username + " connected");
			if (data.username in usernameData) {
				var userData = usernameData[data.username];
				socket.rawGroupNumber = userData.rawGroupNumber;
				socket.teamNumber = userData.teamNumber;
				socket.username = data.username;
				socket.playerNumber = userData.playerNumber;
				socket.groupNumber = userData.groupNumber;
				socket.playerNumberInGroup = userData.playerNumberInGroup;
			} else {
				usernameData[data.username] = {};
				socket.rawGroupNumber = data.groupNumberInput;
				socket.teamNumber = data.teamNumber;
				socket.username = data.username;
				numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] += 1;
				// socket.playerNumber = data.playerNumber + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
				// socket.rawPlayerNumber = data.playerNumber;
				socket.playerNumber = numberOfPlayersConnectedPerGroup[socket.teamNumber-1][socket.rawGroupNumber-1] + ((socket.rawGroupNumber-1) * (numberOfPlayersInGroups)) + ((socket.teamNumber-1) * (numberOfPlayersInTeams));
				//socket.playerNumberInGroup = data.playerNumber;
				usernames[socket.playerNumber] = data.username;
				playerNameToNumber[data.username] = socket.playerNumber;
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
					playerScore: playerScores[socket.playerNumber],
					username: usernames[socket.playerNumber]
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
				for (var i in SOCKET_LIST) {
					emitSocket = SOCKET_LIST[i];
						emitSocket.emit("putPlayerInGameMasterTable", {
						username: data.username,
						groupNumber: socket.groupNumber
					});
				};
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
			
			socket.emit("hasStarted", {
					hasStarted: hasStarted
				});
			
			socket.emit('teamInitiate', {
				playersPerGroup: numberOfPlayersInGroups,
				p: socket.playerNumberInGroup
			});
			socket.emit("getRound", {
				roundNumber: roundNumber
			});

		});
		
		socket.on('stateRequest', function() {
			socket.emit('gameState', {
				screenType: gameStateScreenType,
				decisionMade: playerDecisionMade[socket.playerNumber],
				worldEventNumber: mostRecentWorldEvent,
				teamInLead: teamInLead
			});
		});
		
		socket.on('infoRequest', function() {
			socket.emit('player', {
				number: socket.playerNumberInGroup,
				playerScore: playerScores[socket.playerNumber],
				username: usernames[socket.playerNumber]
			});
			
			socket.emit("groupmates", {
				groupmates: groupmatesDict[socket.playerNumber]
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
			playerDecisionMade[socket.playerNumber] = 0;
			individualWarVotes[data.team - 1][data.side] += 1;
			checkWarVotes(data.team, data.side);
			checkTeamSides(false);
		});

		socket.on("oneTeamWar", function() {
			checkTeamSides(false);
		});

		/*Listeners for epidemic*/
		socket.on("castBorderVote", function(data) {
			playerDecisionMade[socket.playerNumber] = 0;
			individualBorderVotes[data.team - 1][data.side] += 1;
			checkBorderVotes(data.team, data.side);
			checkBorderSides();
		});

		socket.on('beginGame', function() {
			
			hasStarted = true;
		
			for(var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.emit("enable", {});
			};
			
			for(var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.emit("hasStarted", {
					hasStarted: hasStarted
				});
			};
			
			for(var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				groupmates = {};
				groupmatesLowerBound = (numberOfPlayersInTeams*(socket.teamNumber-1)) + (numberOfPlayersInGroups*(socket.rawGroupNumber-1)) + 1;
				groupmatesUpperBound = (numberOfPlayersInTeams*(socket.teamNumber-1)) + (numberOfPlayersInGroups*socket.rawGroupNumber);
				for(i=groupmatesLowerBound; i<=groupmatesUpperBound; i++){
					groupmates[i - ((numberOfPlayersInTeams*(socket.teamNumber-1)) + (numberOfPlayersInGroups*(socket.rawGroupNumber-1)))] = usernames[i];
				};
				delete groupmates[socket.playerNumberInGroup];
				groupmatesDict[socket.playerNumber] = groupmates;
			};
			
			for(var i in SOCKET_LIST) {
				var socket = SOCKET_LIST[i];
				socket.emit("groupmates", {
					groupmates: groupmatesDict[socket.playerNumber]
				});
			};
			
			setInterval(function() {
				//if (decidedPlayers == totalPlayers) {
					//decidedPlayers = 0;
					//resetPlayerDecisionMade();
					//timerMinutes = TIME_LIMIT_MINUTES;
					//timerSeconds = TIME_LIMIT_SECONDS;
					//updateRound();
				//};
			
				if (timerMinutes == 0 && timerSeconds == 0) {
					timerMinutes = TIME_LIMIT_MINUTES;
					timerSeconds = TIME_LIMIT_SECONDS;
					decidedPlayers = 0;
					resetPlayerDecisionMade();
					updateRound();
				};
				
				for(var i in SOCKET_LIST) {
					var socket = SOCKET_LIST[i];
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

		socket.on('congratulations', function() {
			socket.emit('mainWinners', {
				winningTeams: winningTeams,
				winningNames: winningNames,
				playerNameToTeam: playerNameToTeam,
				playerNameToGroup: playerNameToGroup
			});
		});

		socket.on('disconnect', function() {
			delete usernames[socket.playerNumber];
			console.log(socket.username + " has been disconnected");
		});
		
		socket.on('competeInOlympics', function() {
			playerDecisionMade[socket.playerNumber] = 0;
			olympicCompetitors.push(socket.playerNumber);
			decidedPlayers += 1;
			if (decidedPlayers == totalPlayers) {
				carryOutOlympics();
				decidedPlayers = 0;
				olympicCompetitors = [];
			}
		});
		
		socket.on('sendRelief', function() {
			playerDecisionMade[socket.playerNumber] = 0;
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
			playerDecisionMade[socket.playerNumber] = 0;
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
			playerDecisionMade[socket.playerNumber] = 0;
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
				};
			}
		});


		socket.on('advanceRoundGM', function() {
			advanceRoundGM();
		});
		
		socket.on("gameMasterConnect", function(data) {
			socket.emit("giveGameMasterData", {
				NATIONS: NATIONS,
				GROUP_NAMES: GROUP_NAMES,
				numberOfTeams: numberOfTeams,
				numberOfGroups: numberOfGroups
			});
		});
		
		socket.on("scoreChangeGM", function(data) {
			if (data.newTeamScore != null && data.newTeamScore != "") {
				teamScores[data.teamToChange] = data.newTeamScore;
				console.log("loop1");
			}
			else if (data.newGroupScore != null && data.newGroupScore != "") {
				console.log(groupScores);
				groupScores[[data.teamToChange, data.groupToChange]] = data.newGroupScore;
				console.log(groupScores);
				console.log("loop2");

			}
			else if (data.newIndividualScore != null && data.newIndividualScore != "") {
				playerScores[playerNameToNumber[data.usernameToChange]] = data.newIndividualScore;
				console.log("loop3");
			}
			else if (data.newWorldScore != null && data.newWorldScore != "") {
				console.log("loop4");
				world = data.newWorldScore;
			}
		});

		socket.on("removePlayer", function(data) {
			var playerNumberToDelete = playerNameToNumber[data.username];
			delete usernames[playerNumberToDelete];
			delete playerScores[playerNumberToDelete];
			delete usernameData[data.username];
			numberOfPlayersConnectedPerGroup[playerNameToTeam[data.username] - 1][playerNameToGroup[data.username] - 1] -= 1;
			for (var i in SOCKET_LIST) {
				var emitSocket = SOCKET_LIST[i];
				emitSocket.emit("removePlayerFromTable", {
					groupNumber: [playerNameToTeam[data.username], playerNameToGroup[data.username]],
					username: data.username
				});
			};
		});
	});

	


/*FUNCTIONS*/

	var pauseTimer = function() {
		timerPaused = true;
	};
	
	var unpauseTimer = function() {
		timerPaused = false;
	};
	
	var pauseAfterRound = function(func) {
		pauseTimer();
		setTimeout(func(), (afterRoundDelayAmount * 1000));
	};

	function carryOutOlympics() {
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
		console.log("Here are the winners of the Olympics:");
		for (i=0; i<bestPlayers.length; i++) {
			console.log(usernames[bestPlayers[i]] + " from " + NATIONS[playerNameToTeam[usernames[bestPlayers[i]]]]);
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

	function carryOutRelief() {
		for (i=1; i<=numberOfTeams; i++) {
			teamScores[i] += (teamDecisionCounters[i] * reliefDonationCost);
			world += (teamDecisionCounters[i] * reliefDonationResult);
		};
		scoreUpdate(SOCKET_LIST);
		eventOver();
	}

	function carryOutSpaceRace() {
		highestTeam = [];
		bestScoreSoFar = 0;
		for (i=1; i<=numberOfTeams; i++) {
			if (teamDecisionCounters[i] > bestScoreSoFar) {
				bestScoreSoFar = teamDecisionCounters[i];
				highestTeam = [i];
			}
			else if (teamDecisionCounters[i] == bestScoreSoFar) {
				highestTeam.push(i);
			}
		};
		console.log("These teams have the most advanced space program:");
		for (i=0; i<highestTeam.length; i++) {
			console.log(NATIONS[highestTeam[i]]);
			teamScores[highestTeam[i]] += Math.ceil((spaceRaceReward/highestTeam.length));
		}
		bestScoreSoFar = 0;
		scoreUpdate(SOCKET_LIST);
		eventOver();
	};

	var checkWorldEvents = function() {
		startWorldEvent(worldEventNumber);
	};

	function carryOutInvestigations(sockets) {
		var teamCount = 0;
		for (i=0;i<pastActions.length;i++) {
			teamCount += 1;
			groupCount = 0;
			for (j=0;j<pastActions[i].length;j++) {
				groupCount += 1;
				playerCount = 0;
				for (k=0;k<pastActions[i][j].length;k++) {
					playerCount += 1;
					var counter = 0;
					for (l=0;l<pastActions[i][j][k].length;l++) {
						if (pastActions[i][j][k][l] == 1) {
							counter += 1;
						}
					}
					if (counter == 0) {
						for (m=0;m<investigationLists[i][j][k].length;m++) {
							playerToLosePointsNumber = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + parseInt(investigationLists[i][j][k][m], 10);
							playerScores[playerToLosePointsNumber] += -(Math.floor(((investigationCost)/(investigationLists[i][j][k].length))));
						}
					}
					else {
						for (m=0;m<investigationLists[i][j][k].length;m++) {
							playerToGainPointsNumber = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + parseInt(investigationLists[i][j][k][m], 10);
							playerScores[playerToGainPointsNumber] += Math.ceil(((2*counter)/(investigationLists[i][j][k].length)));
						};
						playerCaught = (numberOfPlayersInTeams*(i)) + (numberOfPlayersInGroups*(j)) + k + 1;
						playerScores[playerCaught] += (-2 * counter);
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
			socket.emit('showImpact', {
				playerScore: playerScores[socket.playerNumber]
			});
		}
		unpauseTimer();
		resetPlayerDecisionMade();
		gameStateScreenType = "decision";
	};
	
	var checkPlayers = function(mode) {
		decidedPlayers++;
		if (mode == "waitForPlayers") {
			if (decidedPlayers == totalPlayers) {
				for(var i in SOCKET_LIST) {
					var socket = SOCKET_LIST[i];
					socket.emit("groupmates", {
						groupmates: groupmatesDict[socket.playerNumber]
					});
				};
				decidedPlayers = 0;
				resetPlayerDecisionMade();
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

	var updateRound = function() {
		endGame(SOCKET_LIST);
		for(var i in SOCKET_LIST) {
			var socket = SOCKET_LIST[i];
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
		//unpauseTimer();
		quarterlyReport(SOCKET_LIST);
		roundNumber++;
	};

	var quarterlyReport = function(sockets) {
		worldEventChance += 1;
		if (roundNumber < 3 || roundNumber == 5 || roundNumber == 8 || roundNumber == 11) {
			worldEventChance = 0;
		}
		if (roundNumber % 3 == 0 && roundNumber != 12) {
			pauseTimer();
			quarter++;
			gameStateScreenType = "investigation";
			for (var i in sockets) {
				var socket = sockets[i];
				quarterTeamScores = teamScores;
				socket.emit('quarter', {
					teamScores: teamScores,
					groupScores: groupScores
				});
				socket.emit('nextRound', {
					roundNumber: "Investigations"
				});
				socket.emit('newQuarter', {
					quarter: quarter
				});
				
			};
			worldEventChance = 1;
		}
		else {
			//unpauseTimer();
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
		if (worldEventChance == 1) {	//search for this
			if (Math.random() <= .333) {	//should say <= .333 instead of 1
				carryOutWorldEvent(worldEvents[chosenEvent], chosenEvent); //should say, chosenEvent instead of 0
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
		else{
			unpauseTimer();
		};
	};
	
	function carryOutWorldEvent(worldEvent, chosenEvent) {
		gameStateScreenType = "event";
		eventsCompleted.push(chosenEvent);
		mostRecentWorldEvent = chosenEvent;
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
			decidedPlayers += numberOfPlayersInTeams;
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
		var currentPercentFor = individualWarVotes[team - 1][side] / numberOfPlayersInTeams;
		var teamNotPlaced = true;
		for (var i = 0; i < teamSides[side].length; i++) {
			if (teamSides[side][i] == team) {
				teamNotPlaced = false;
			};
		};
		if (currentPercentFor >= THRESHOLD && teamNotPlaced) {
			teamSides[side].push(team);
		};
		decidedPlayers += 1;
	};

	function checkTeamSides(gmoverride) {
		if (decidedPlayers == totalPlayers || gmoverride) {
			var groupBonus = WAR_WINNING_BONUS / numberOfGroups;
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
					teamScores[teamSides[0][i]] += WAR_WINNING_BONUS;
					for (var j = 1; j <= numberOfGroups; j++) {
						groupScores[[teamSides[0][i], j]] += groupBonus;
					};
				};
				console.log("Winning score: " + team0Score);
				console.log("Here is the winning team:");
				for (var i = 0; i < teamSides[0].length; i++) {
					console.log(NATIONS[teamSides[0][i]]);
				};
			} else {
				for (var i = 0; i < teamSides[1].length; i++) {
					teamScores[teamSides[1][i]] += WAR_WINNING_BONUS;
					for (var j = 1; j <= numberOfGroups; j++) {
						groupScores[[teamSides[1][i], j]] += groupBonus;
					};
				};
				console.log("Winning score: " + team1Score);
				console.log("Here is the winning team:");
				for (var i = 0; i < teamSides[1].length; i++) {
					console.log(NATIONS[teamSides[1][i]]);
				};
			};
			eventOver();
			decidedPlayers = 0;
			scoreUpdate(SOCKET_LIST);
			unpauseTimer();
			resetPlayerDecisionMade();
 		};
	};

	function checkBorderVotes(team, side) {
		var currentPercentFor = individualBorderVotes[team - 1][side] / numberOfPlayersInTeams;
		var teamNotPlaced = true;
		for (var i = 0; i < borderSides[side].length; i++) {
			if (borderSides[side][i] == team) {
				teamNotPlaced = false;
			};
		};
		if (currentPercentFor >= THRESHOLD && teamNotPlaced) {
			borderSides[side].push(team);
			if (side == 0) {
				console.log(NATIONS[team] + " has closed their borders!");
			} else {
				console.log(NATIONS[team] + " has left their borders open!");
			};
		};
		decidedPlayers += 1;
	};

	function checkBorderSides(gmoverride) {
		if (decidedPlayers == totalPlayers || gmoverride) {
			var groupBonus = BORDER_TEAM_BONUS / numberOfGroups;
			for (var i = 0; i < borderSides[0].length; i++) {
				var team = borderSides[0][i];
				world -= BORDER_WORLD_BONUS;
				teamScores[team] += BORDER_TEAM_BONUS;
				for (var j = 1; j <= numberOfGroups; j++) {
					groupScores[[team, j]] += groupBonus;
				};
			};
			for (var i = 0; i < borderSides[1].length; i++) {
				var team = borderSides[1][i];
				world += BORDER_WORLD_BONUS;
				teamScores[team] -= BORDER_TEAM_BONUS;
				for (var j = 1; j <= numberOfGroups; j++) {
					groupScores[[team, j]] -= groupBonus;
				};
			};
			eventOver();
			decidedPlayers = 0;
			scoreUpdate(SOCKET_LIST);
			unpauseTimer();
			resetPlayerDecisionMade();
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
		resetPlayerDecisionMade();
		unpauseTimer();
		gameStateScreenType = "decision";
	};
	
	function resetPlayerDecisionMade() {
		for (i=1; i<=totalPlayers; i++) {
			playerDecisionMade[i] = -1;
		};
	};

	function advanceRoundGM(){
		console.log("Gamemaster has advanced to the next round");
			if(gameStateScreenType=="decision"){
				console.log("Gamemaster is not allowed to advance from decision screen")

			}
			else if(gameStateScreenType=="investigation"){
				carryOutInvestigations(SOCKET_LIST);
				numberOfInvestigations = 0;
				enableAllButtons(SOCKET_LIST);
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
			}

			else if(gameStateScreenType=="event"){
				switch(mostRecentWorldEvent){
					case 0:
						checkTeamSides(true);
						break;
					case 1:
						checkBorderSides(true);
						break;
					case 2:
						carryOutOlympics();
						break;
					case 3:
						carryOutRelief();
						break;
					case 4:
						carryOutSpaceRace();
						break;
				};
				decidedPlayers = 0;
				totalYesVotes = 0;
				olympicCompetitors = [];
				for (i=1; i<=numberOfTeams; i++) {
					teamDecisionCounters[i] = 0;
				};

			}
			/* socket.emit('gameStateDisplay', {
				screenType: gameStateScreenType,
				decisionMade: playerDecisionMade[socket.playerNumber],
				worldEventNumber: mostRecentWorldEvent,
				teamInLead: teamInLead
			}); */

	};
	