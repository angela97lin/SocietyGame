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
	var groups = [];

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
		that.makeTeamScore();
		return teamScore;
	};

	/**
	* Makes the team score from the group scores
	*/
	that.makeTeamScore = function() {
		var newTeamScore = 0;
		groups.forEach(function(group) {
			newTeamScore += group.getGroupScore();
		});
		teamScore = newTeamScore;
	};

	/**
	* Gets the group specified by group number
	*
	* @param {Integer} groupNumber - the number of group
	*/
	that.getGroup = function(groupNumber) {
		return groups[groupNumber - 1];
	};

	/**
	* Makes the decision specified by decision number
	*
	* @param {Integer} decisionNumber - the number of the decision that will be made
	* @param {Integer} playerNumber - the number of the player that made the decision
	* @param {Integer} groupNumber - the number of the group that player is in
	*/
	that.makeDecision = function(decisionNumber, groupNumber, playerNumber) {
		var group = that.getGroup(groupNumber);
		group.makeDecision(decisionNumber, playerNumber);
	};

	Object.freeze(that);
	return that;

};

module.exports = Team;