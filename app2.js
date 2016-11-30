var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var session = require("express-session");
var app = express();
var serv = require("http").createServer(app);
serv.listen(process.env.PORT || 3000, "0.0.0.0");
console.log("server started");
var io = require("socket.io")(serv, {});

var Player = require("../data/player.js");
var Group = require("../data/group.js");
var Team = require("../data/team.js");
var World = require("../data/world.js");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

/**
* Allows the server to save information
*/
app.use(session({secret: "4746", resave: true, saveUninitialized: true}));

var socketList = [];
var playerSocketList = [];

const NATIONS = {1: "Russia",
			     2: "India",
			     3: "Japan",
			     4: "Mexico",
			     5: "Germany",
			     6: "China",
			     7: "UK"};

const GROUP_NAMES = {1: "Education",
					 2: "Workforce",
					 3: "Intelligence Agency",
					 4: "Policy Makers"};
			  
const MODES = {1: "timer",
			   2: "waitForPlayers"};

const USERNAME_TO_TEAM = {"Ms. Frizzle": 1,
						  "Mrs. Pancakes": 1,
						  "Professor Snape": 1,
						  "Professor X": 2,
						  "Dr. Manhattan": 2,
						  "John Keating": 2,
						  "Tyler Durden": 1,
						  "Turanga Leela": 1,
						  "Michael Scott": 1,
						  "Robocop": 2,
						  "Rosie the Riveter": 2,
						  "Commissioner Gordon": 2};
	
const USERNAME_TO_GROUP = {"Ms. Frizzle": 1,
						   "Mrs. Pancakes": 1,
						   "Professor Snape": 1,
						   "Professor X": 1,
						   "Dr. Manhattan": 1,
						   "John Keating": 1,
						   "Tyler Durden": 2,
						   "Turanga Leela": 2,
						   "Michael Scott": 2,
						   "Robocop": 2,
						   "Rosie the Riveter": 2,
						   "Commissioner Gordon": 2};

const DECISIONS = [{1: "Pocket money from school fundraiser",
					2: "Buy school supplies for students out of pocket",
				    3: "Inflate students' test scores",
			    	4: "Go teach for a year to impoverished students",
					5: "Volunteer to run after-school environmental club"},
				   {1: "Buy a boat with company money",
					2: "Come in on Saturdays",
					3: "Switch production to fossil fuels for a month to lower production costs",
					4: "Donate to charity",
					5: "Outsource jobs to another country"},
				   {1: "Sell fake identities on the black market",
					2: "Become an undercover agent to reduce crime in your cities",
					3: "Take bribe to censor the nation's failed safety inspections",	//wasn't clear how it benefits individual
					4: "Risk your career to reveal a world terrorist orginization", 	//why is it bad for you? why isnt it bad for your country? why is it good for the world?
					5: "Start propaganda campaign claiming your nation is best"},	//unclear as what type of conspiracy theories...how do they help you? +,++,--
				   {1: "Take a bribe to lower emissions requirements",
					2: "Attend every voting session",
					3: "Impose tariffs on international trade",
					4: "Give time to international disaster relief organization",
					5: "Take bribe to deport criminal"}]; 	//doesnt seem less selfish than 1

var world; 
var decisionMode;
var totalNumberOfPlayers;
var numberOfGroups;
var numberOfTeams;
var numberOfPlayersInGroups;
var numberOfPlayersInTeams;
var usernames = [];
var userData = {};

io.sockets.on("connection", function(socket) {
	var typeOfConnection = socket.handshake.headers.referer.split(/\//)[3];
	if (typeOfConnection == "main") {
		mainSocket = socket;
	} else if (typeOfConnection == "gamemaster") {
		gameMasterSocket = socket;
		socket.emit("gameMasterConnect", {
			NATIONS: NATIONS,
			GROUP_NAMES: GROUP_NAMES
		});
	} else if (typeOfConnection == "index") {
		playerSocketList.push(socket);
		socket.emit("playerConnect", {
			NATIONS: NATIONS,
			GROUP_NAMES: GROUP_NAMES,
			USERNAME_TO_GROUP: USERNAME_TO_GROUP,
			USERNAME_TO_TEAM: USERNAME_TO_TEAM,
			DECISIONS: DECISIONS,
			usernames: usernames
		});
	};

	socket.on("gameSettings", function(data) {
		decisionMode = MODES[data.decisionMode];
		world = World();
		world.makeWorldScore(data.totalNumberOfPlayers);
		totalNumberOfPlayers = data.totalNumberOfPlayers;
		numberOfGroups = data.totalNumberOfGroups;
		numberOfTeams = data.numberOfTeams;
		numberOfPlayersInGroups = data.numberOfPlayersInGroups;
		numberOfPlayersInTeams = data.numberOfPlayersInTeams;
		for (var i = 1; i <= numberOfTeams; i++) {
			var teamToAdd = Team(i);
			for (var j = 1; j <= numberOfGroups; j++) {
				var groupToAdd = Group(j);
				teamToAdd.addGroup(groupToAdd);
			};
			world.addTeam(teamToAdd);
		};
		//TODO: set up timer
	});

	socket.on("getPlayerData", function (data) {

	});

	socket.on("decision", function (data) {
	    var decisionNumber = data.decisionNumber;
	    var teamNumber = data.teamNumber;
	    var groupNumber = data.groupNumber;
	    var playerNumber = data.playerNumber;
	    world.makeDecision(decisionNumber, teamNumber, groupNumber, playerNumber);
	});

	socket.on("worldEventDecision", function (data) {
	    var decisionNumber = data.decisionNumber;
	    var teamNumber = data.teamNumber;
	    var groupNumber = data.groupNumber;
	    var playerNumber = data.playerNumber;
	    world.worldEventMakeDecision(decisionNumber, teamNumber, groupNumber, playerNumber);
	})
});

app.listen(process.env.PORT || 3000, function() {
	console.log("server started");
});