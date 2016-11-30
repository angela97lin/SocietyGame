/**
* Represents a player in the Society Game
*
* @param {String} name - the name of the player
* @param {Integer} number - the number assigned to the player
*/
var Player = function(name, number) {

	var that = Object.create(Player.prototype);
	
	var STARTING_PLAYER_SCORE = 20;

	var DECISIONS_IMPACTS = [2, -1, 1, -1];

	var INVESTIGATION_COST = 12;

	//the current score of the player
	var playerScore = STARTING_PLAYER_SCORE;

	//the decisions that the player has made in the game
	var decisions = [];

    //the decision that the player made in the current world event (0 if hasn't made a decision yet)
	var worldEventDecision = 0;

	/**
	* Increases player score by amount
	*
	* @param {Integer} amount - the amount that will be added to the player score
	*/
	that.updatePlayerScore = function(amount) {
		playerScore += amount;
	};

	/**
	* Gets the score of the player
	*/
	that.getPlayerScore = function() {
		return playerScore;
	};

	/**
	* Gets the name of the player
	*/
	that.getName = function() {
		return name;
	};

	/**
	* Gets the number of the player
	*/
	that.getNumber = function() {
		return number;
	};

	/**
	* Gets the decisions the player has made
	*/
	that.getDecisions = function() {
		return decisions.slice(0);
	};

	/**
	* Updates the player score based on the decision made by the player
    *
    * @param {Integer} decisionNumber - the number of the decision that will be made
	*/
	that.makeDecision = function(decisionNumber) {
		that.updatePlayerScore(DECISIONS_IMPACTS[decisionNumber - 1]);
		decisions.push(decisionNumber);
	};

    /*
    * Sets the players world event decision to the decision they chose
    *
    * @param {Integer} decisionNumber - the number of the decision that the player chose
    */
	that.setWorldEventDecision = function (decisionNumber) {
	    worldEventDecision = decisionNumber;
	};

    /*
    * Resets the players world event decision to the default
    */
	that.resetWorldEventDecision = function () {
	    worldEventDecision = 0;
	};

    /*
    * Returns the world event decision of the player (0 if no decision was made)
    */
	that.getWorldEventDecision = function () {
	    return worldEventDecision;
	};

	/**
	* Carries out an investigation of a player
	*
	* @param {Player} - the player that is being investigated
	* @param {Integer} - the number of players that are investigating the player
	* @param {Integer} - the quarter that the game is currently in
	*/
	that.investigate = function(player, numInvestigating, quarter) {
		var lastRound = quarter * 3;
		var caughtPlayer = false;
		player.getDecisions().slice(lastRound - 3, lastRound).forEach(function(decision) {
			if (decision == 1) {
				caughtPlayer = true;
				that.updatePlayerScore(DECISIONS_IMPACTS[0]);
				player.updatePlayerScore(-DECISIONS_IMPACTS[0]);
			};
		});
		if (!caughtPlayer) {
			that.updatePlayerScore(-(INVESTIGATION_COST/numInvestigating));
		};
	};

	Object.freeze(that);
	return that;

};

module.exports = Player;