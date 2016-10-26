var assert = require("assert");

var Player = require("../data/player.js");

describe("Player", function() {

	describe("make decision", function() {

		it("should increase by 2", function() {
			var player = Player("Harambe", 1);
			player.makeDecision(1);
			assert.equal(player.getPlayerScore(), 22);
		});

	});

});