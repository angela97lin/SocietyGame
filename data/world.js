/**
* Represents the world in the Society Game
*/
var World = function() {

    var that = Object.create(World.prototype);

    //the current score of the world
    var worldScore;

    //the teams that are in the world
    var teams;

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

    Object.freeze(that);
    return that;
}

