/**
* Represents the world in the Society Game
*/
var World = function() {

    var that = Object.create(World.prototype);

    //the current score of the world
    var worldScore;

    //the teams that are in the world
    var teams;


    /*
    * Gets the world score
    */
    that.getWorldScore = function() {
        return score;
    }


    /*
    * Increases the world score by amount
    *
    * @param {Integer} amount - the amount to be added to the world score
    */
    that.updateWorldScore = function(amount) {
        worldScore += amount;
    }


}

