/**
* Represents a player in the Society Game
*
* @param {String} name - the name of the player
* @param {Integer} number - the number assigned to the player
*/
var Player = function(name, number) {

	var that = Object.create(Player.prototype);
	
	var STARTING_PLAYER_SCORE = 20;

	//the current score of the player
	var playerScore = STARTING_PLAYER_SCORE;

	//the decisions that the player has made in the game
	var decisions;

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

	Object.freeze(that);
	return that;

};

module.exports = Player;