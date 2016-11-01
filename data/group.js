/**
* Represents a group in the society game
*
* @param {Integer} number - the group number that will determine what the group type is
*/
var Group = function(number) {
	
	var that = Object.create(Group.prototype);

	var STARTING_GROUP_SCORE = 20;

	var DECISION_IMPACT = [-1, 2, 1, 0];

	//the score of the group
	var groupScore = STARTING_GROUP_SCORE;

	//the players that are in the group
	var players = [];

	//the investigations made by the players in the group
	var investigations;

	/**
	* Increases the group score by amount
	*
	* @param {Integer} amount - the amount that will be added to the group score
	*/
	that.updateGroupScore = function(amount) {
		groupScore += amount;
	};

	/**
	* Gets the group score
	*/
	that.getGroupScore = function() {
		return groupScore;
	};

	/**
	* Adds a player to the group
	*
	* @param {Player} player - the player to be added to the group
	*/
	that.addPlayer = function(player) {
		players.push(player);
	};

	/**
	* Gets the players in the group
	*/
	that.getPlayers = function() {
		return players.slice(0);
	};

	/**
	* Gets the player specified by player number
	*
	* @param {Integer} playerNumber - the number of the player
	*/
	that.getPlayer = function(playerNumber) {
		return players[playerNumber - 1];
	};

	/**
	* Makes the decision specified by the decision number
	*
	* @param {Integer} decisionNumber - the number of the decision that will be made
	* @param {Integer} playerNumber - the number of the player that made the decision
	*/
	that.makeDecision = function(decisionNumber, playerNumber) {
		that.updateGroupScore(DECISION_IMPACT[decisionNumber - 1]);
		that.getPlayer(playerNumber).makeDecision(decisionNumber);
	};

	Object.freeze(that);
	return that;

};

module.exports = Group;