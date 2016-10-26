/**
* Represents a group in the society game
*
* @param {Integer} number - the group number that will determine what the group type is
*/
var Group = function(number) {
	
	var that = Object.create(Group.prototype);

	var STARTING_GROUP_SCORE = 20;

	//the score of the group
	var groupScore;

	//the players that are in the group
	var players;

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

	Object.freeze(that);
	return that;

};

module.exports = Group;