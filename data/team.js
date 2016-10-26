

/**
* Represents a team in the Society Game
*
* @param {Integer} number - the team number that will determine which nation the team is on
*/
var Team = function(number) {
	
	var that = Object.create(Team.prototype);

	//the current score of the team
	var teamScore;

	//the groups that are on the team
	var groups;

	/**
	* Adds the group to the team
	*
	* @param {Group} group - the group that will be added to the team
	*/
	that.addGroup = function(group) {
		groups.push(group);
	};

	/**
	* Gets the groups in the team
	*/
	that.getGroups = function() {
		return groups.slice(0);
	};

	/**
	* Increases the team score by amount
	*
	* @param {Integer} amount - the amount to be added to the team score
	*/
	that.updateTeamScore = function(amount) {
		teamScore += amount;
	};

	/**
	* Gets the team score
	*/
	that.getTeamScore = function() {
		return teamScore;
	};

	Object.freeze(that);
	return that;

};