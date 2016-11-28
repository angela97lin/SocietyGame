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

var uniquePlayerNumber = 0;
var socketList = {};
var playerSocketList = {};

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

var world; 
var decisionMode;
var totalNumberOfPlayers;
var numberOfGroups;
var numberOfTeams;

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
		playerSocketList.uniquePlayerNumber = socket;
		uniquePlayerNumber++;
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
			
		}
	});

});

app.listen(process.env.PORT || 3000, function() {
	console.log("server started");
});