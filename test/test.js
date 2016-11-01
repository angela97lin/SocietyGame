var assert = require("assert");

var Player = require("../data/player.js");
var Group = require("../data/group.js");
var Team = require("../data/team.js");

describe("Player", function() {

	describe("make decision", function() {

		it("should increase by 2", function() {
			var player = Player("Harambe", 1);
			player.makeDecision(1);
			assert.equal(player.getPlayerScore(), 22);
		});

	});

	describe("investigate", function() {

		it("should increase score by 4", function() {
			var player1 = Player("Harambe", 1);
			var player2 = Player("Datboi", 2);
			player2.makeDecision(1);
			player2.makeDecision(2);
			player2.makeDecision(1);
			player1.investigate(player2, 1, 1);
			assert.equal(player1.getPlayerScore(), 24);
			assert.equal(player2.getPlayerScore(), 19);
		});

		it("should decrease by 6", function() {
			var player1 = Player("Harambe", 1);
			var player2 = Player("Datboi", 2);
			player2.makeDecision(2);
			player2.makeDecision(2);
			player2.makeDecision(2);
			player1.investigate(player2, 2, 1);
			assert.equal(player1.getPlayerScore(), 14);
			assert.equal(player2.getPlayerScore(), 17);
		});

	});

});

describe("Group", function() {

	describe("make decision", function() {

		it("player score should decrease by 1 and group score should increase by 2", function() {
			var player = Player("Harambe", 1);
			var group = Group(2);
			group.addPlayer(player);
			assert.equal(group.getPlayer(1), player);
			group.makeDecision(2, 1);
			assert.equal(group.getGroupScore(), 22);
			assert.equal(player.getPlayerScore(), 19);
		});

	});

});

describe("Team", function() {

	describe("make team score", function() {

		it("should be 40", function() {
			var group1 = Group(1);
			var group2 = Group(2);
			var team = Team(3);
			team.addGroup(group1);
			team.addGroup(group2);
			assert.equal(team.getTeamScore(), 40);
		});

	});

	describe("make decision", function() {

		it("should be 21", function() {
			var player = Player("Harambe", 1);
			var group = Group(1);
			group.addPlayer(player);
			var team = Team(3);
			team.addGroup(group);
			team.makeDecision(3, 1, 1);
			assert.equal(team.getTeamScore(), 21);
		});

	});

});