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
    var unusedWorldEvents = [1, 2, 3, 4, 5];

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
    * Selects a random unused world event and starts it
    */
    that.chooseRandomWorldEvent = function () {
        randomNumber = Math.floor((Math.random() * unusedWorldEvents.length));
        worldEventNumber = unusedWorldEvents.splice(randomNumber, 1);
        startWorldEvent(worldEventNumber);
    };

    /*
    * Starts the specified world event
    *
    *@param {Integer} worldEventNumber - the number of the world event to be initiated
    */
    that.startWorldEvent = function (worldEventNumber) {
        switch (worldEventNumber) {
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

    };

    /*
    * Starts and handles the world event corresponding to a Natural Disaster
    */
    that.startNaturalDisaster = function () {

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