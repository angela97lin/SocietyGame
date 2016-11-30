/**
* Represents the world in the Society Game
*/
var World = function() {

    var that = Object.create(World.prototype);

    //the total number of players in this session
    var NUM_TOTAL_PLAYERS;

    //the current score of the world
    var worldScore;

    //the teams that are in the world
    var teams = [];

    //world event numbers that are unused so far
    var unusedWorldEvents = [0, 1, 2, 3, 4];

    //the world event currently happening (-1 if none)
    var currentWorldEvent = -1;

    //the number of players that have made a decision so far this round
    var numDecidedPlayers = 0;

    /**
	* Adds the team to the world
	*
	* @param {Team} team - the team that will be added to the world
	*/
    that.addTeam = function (team) {
        teams.push(team);
    };

    /**
	* Gets the teams in the world
	*/
    that.getTeams = function () {
        return teams.slice(0);
    };

    /**
    * Gets the team with the specified team number
    *
    * @param {Integer} teamNumber - the number of the team that will be returned
    */
    that.getTeam = function(teamNumber) {
        return teams[teamNumber - 1];
    };


    /*
    * Gets the world score
    */
    that.getWorldScore = function () {
        return score;
    };


    /*
    * Increases the world score by amount
    *
    * @param {Integer} amount - the amount to be added to the world score
    */
    that.updateWorldScore = function (amount) {
        worldScore += amount;
    };

    /**
    * Makes the world score based off of the total number of players in the game
    *
    * @param {Integer} numPlayers - the total number of players that are in the game
    */
    that.makeWorldScore = function(numPlayers) {
        var newWorldScore = 0;
        newWorldScore = Math.floor(((0.00012149 * (Math.pow(numPlayers,3))) - (0.03348123*(Math.pow(numPlayers,2))) + (3.8385*numPlayers) - 0.3781)/5.0)*5.0;
        worldScore = newWorldScore;
    };

    /**
    * Adds a player to the team and group specified
    *
    * @param {Integer} teamNumber - the number of the team that the player will be placed
    * @param {Integer} groupNumber - the number of the group that the player will be placed
    * @param {Player} player - the player that will be placed into the specified team and group
    */
    that.addPlayer = function(teamNumber, groupNumber, player) {
        var team = that.getTeam(teamNumber);
        team.addPlayer(groupNumber, player);
    };

    /**
    * Gets the number of players in the group specified
    *
    * @param {Integer} teamNumber - the team that the group is in
    * @param {Integer} groupNumber - the number of the group whose number of players will be given
    */
    that.getNumPlayersInGroup = function(teamNumber, groupNumber) {
        return that.getTeam(teamNumber).getNumPlayersInGroup(groupNumber);
    };

    /**
    * Gets the score of the team specified
    *
    * @param {Integer} teamNumber - the number of the team whose score will be given
    */
    that.getTeamScore = function(teamNumber) {
        return that.getTeam(teamNumber).getTeamScore();
    };

    /**
    * Gets the score of the group specified
    *
    * @param {Integer} teamNumber - the number of the team that the group is in
    * @param {Integer} groupNumber - the number of the group whose score will be given
    */
    that.getGroupScore = function(teamNumber, groupNumber) {
        return that.getTeam(teamNumber).getGroupScore(groupNumber);
    };

    /**
    * Gets the score of the player specified
    *
    * @param {Integer} teamNumber - the number of the team that the player is on
    * @param {Integer} groupNumber - the number of the group that the player is in
    * @param {Integer} playerNumber - the number of the player whose score will be given
    */
    that.getPlayerScore = function(teamNumber, groupNumber, playerNumber) {
        return that.getTeam(teamNumber).getPlayerScore(groupNumber, playerNumber);
    };

    /*
    * Affects the world score based on a players decision and passes the decision down to the relevant team
    *
    * @param {Integer} decisionNumber - the number of the decision that the player made
    * @param {Integer} teamNumber - the number of the team that the decided player is on
    * @param {Integer} groupNumber - the number of the group that the decided player is on
    * @param {Integer} playerNumber - the number of the decided player
    */
    that.makeDecision = function (decisionNumber, teamNumber, groupNumber, playerNumber) {
        switch (decisionNumber) {
            //TODO: Update decision information
            case 1:
                that.updateWorldScore(-1);
                break;
            case 2:
                that.updateWorldScore(0);
                break;
            case 3:
                that.updateWorldScore(-1);
                break;
            case 4:
                that.updateWorldScore(+2);
                break;
            case 5:
                that.updateWorldScore(0);
                break;
            default:
                console.log("decision does not exist");
        }
        var team = that.getTeam(teamNumber);
        team.makeDecision(decisionNumber, groupNumber, playerNumber);
        that.decisionMade();
    }

    /*
    * Alerts the World that a decision was made and checks if all players have made a decision
    */
    that.decisionMade = function () {
        numDecidedPlayers += 1;
        if (numDecidedPlayers == NUM_TOTAL_PLAYERS) {
            numDecidedPlayers = 0;
            if (GameControl.timer > 5) {
                timer = 5;
            }
        }
    };

    /*
    * Ends the current round
    */
    that.endRound = function () {
        //TODO: write endRound function
    }

    /*
    * Returns a random unused world event number
    */
    that.chooseRandomWorldEvent = function () {
        randomNumber = Math.floor((Math.random() * unusedWorldEvents.length));
        worldEventNumber = unusedWorldEvents.splice(randomNumber, 1);
        return worldEventNumber;
    };

    /*
    * Sets the current world event to the number given
    *
    * @param {Integer} worldEventNumber - the number of the new current world event
    */
    that.setWorldEventNumber = function (worldEventNumber) {
        currentWorldEvent = worldEventNumber;
    };

    /*
    * Records the player's made decision to the world event
    *
    * @param {Integer} decisionNumber - the number of the decision that the player made
    * @param {Integer} teamNumber - the number of the team that the decided player is on
    * @param {Integer} groupNumber - the number of the group that the decided player is on
    * @param {Integer} playerNumber - the number of the decided player
    */
    that.worldEventMakeDecision = function (decisionNumber, teamNumber, groupNumber, playerNumber) {
        switch (currentWorldEvent) {
            case 1:
                that.getTeam(teamNumber).getGroup(groupNumber).getPlayer(playerNumber).setWorldEventDecision(1);
                break;
            case 2:
                that.getTeam(teamNumber).getGroup(groupNumber).getPlayer(playerNumber).setWorldEventDecision(2);
                break;
            default:
                console.log("that decision does not exist");
        }
        that.worldEventDecisionMade();
    };

    /*
    * Alerts the world that a world event decision was made and checks if all decisions have been made
    */
    that.worldEventDecisionMade() = function () {
        numDecidedPlayers += 1;
        if (numDecidedPlayers == NUM_TOTAL_PLAYERS) {
            numDecidedPlayers = 0;
            that.startWorldEvent();
        };
    };

    /*
    * Starts the correct world event (call only when everyone has made a decision)
    */
    that.startWorldEvent = function () {
        switch (currentWorldEvent) {
            case 0:
                startWar();
                break;
            case 1:
                startEpidemic();
                break;
            case 2:
                startOlympics();
                break;
            case 3:
                startNaturalDisaster();
                break;
            case 4:
                startSpaceRace();
                break;
            default:
                console.log("world event does not exist");
        }
    };

    /*
    * Ends the current world event and returns back to the game
    */
    that.endWorldEvent = function () {
        //TODO: endWorldEvent function
    }

    /*
    * Starts and handles the world event corresponding to a World War
    */
    that.startWar = function () {

    };

    /*
    * Starts and handles the world event corresponding to an Epidemic
    */
    that.startEpidemic = function () {

    };

    /*
    * Starts and handles the world event corresponding to the Olympics
    */
    that.startOlympics = function () {
        var individualScores = [];
        //for each team
        for (var i = 0; i < that.getTeams().length; i++) {
            //for each group in that team
            for (var j = 0; j < that.getTeam(i).getGroups().length; j++) {
                //for each player in that group
                for (var k = 0; k < that.getTeam(i).getGroup(j).getPlayers().length; k++) {
                    var team = that.getTeam(i);
                    var group = that.getTeam(i).getGroup(j);
                    var player = that.getTeam(i).getGroup(j).getPlayer(k);
                    //a value of 1 indicates they entered the olympics
                    if (player.getWorldEventDecision() == 1) {
                        var playerAndScore = [player.getPlayerScore(), player, group, team];
                        individualScores.push(playerAndScore);
                        //-2 is the cost of the Olympics, hard-coded for now
                        player.updatePlayerScore(-2);
                    };
                };
            };
        };
        //sorts the array of participating players by players' scores
        individualScores.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (var i = 0; i < individualScores.length; i++) {
            //if the score is at least tied for the third highest score
            if (individualScores[i][0] >= individualScores[2][0]) {
                //3 is the individual reward for being a winner in the olympics, hard-coded for now
                individualScores[i][1].updatePlayerScore(3);
                //6 is the group reward for being a winner in the olympics, hard-coded for now
                individualScores[i][2].updateTeamScore(6);
            }
        };
        that.endWorldEvent();
    };

    /*
    * Starts and handles the world event corresponding to a Natural Disaster
    */
    that.startNaturalDisaster = function () {
        //for each team
        for (var i = 0; i < that.getTeams().length; i++) {
            //for each group in that team
            for (var j = 0; j < that.getTeam(i).getGroups().length; j++) {
                //for each player in that group
                for (var k = 0; k < that.getTeam(i).getGroup(j).getPlayers().length; k++) {
                    var team = that.getTeam(i);
                    var group = that.getTeam(i).getGroup(j);
                    var player = that.getTeam(i).getGroup(j).getPlayer(k);
                    //a value of 1 indicates that this player sent a relief team
                    if (player.getWorldEventDecision() == 1) {
                        group.updateGroupScore(-1);
                        that.updateWorldScore(1);
                    };
                };
            };
        };
        that.endWorldEvent();
    };

    /*
    * Starts and handles the world event corresponding to a Space Race
    */
    that.startSpaceRace = function () {

    };

    Object.freeze(that);
    return that;
};

module.exports = World;