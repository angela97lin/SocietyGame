/**
* Acts as the game controller in Society Game
*/
var GameControl = function() {

    var that = Object.create(GameControl.prototype);

    //the time left in the round
    var timer;

    //whether the timer is paused
    var timerPaused;

    //the round that the game is on
    var roundNumber = 1;

    //the current state that the game is in
    var state;

    /*
    * Starts the round timer
    */
    that.startTimer = function () {
        timerPaused = false;
    };

    /*
    * Pauses the round timer
    */
    that.pauseTimer = function () {
        timerPaused = true;
    };

    /*
    * Gets the timer's time
    */
    that.getTimer = function () {
        return timer;
    };

    /*
    * Sets the timer to a new time
    *
    *
    */
    that.setTimer = function (newTime) {
        timer = newTime;
    };

    /*
    * Gets the round number
    */
    that.getRoundNumber = function () {
        return roundNumber;
    };

    /*
    * Increments the round number
    */
    that.incrementRoundNumber = function () {
        roundNumber += 1;
    };








    Object.freeze(that);
    return that;
}

