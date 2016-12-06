/**
* Acts as the game controller in Society Game
*/
var GameControl = function() {

    var that = Object.create(GameControl.prototype);

    //the number of full minutes left in the round
    var timerMinutes;

    //the number of seconds (mod 60) left in the round
    var timerSeconds;

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
    * Returns whether the timer is paused
    */
    that.getTimerPaused = function () {
        return timerPaused;
    }

    /*
    * Gets the timer's minutes remaining
    */
    that.getTimerMinutes = function () {
        return timerMinutes;
    };

    /*
    * Gets the timer's seconds remaining
    */
    that.getTimerSeconds = function () {
        return timerSeconds;
    };

    /*
    * Sets the timer to a new time
    *
    * @param {Integer} minutes - the number of minutes of the new time to be displayed
    * @param {Integer} seconds - the number of seconds of the new time to be displayed
    */
    that.setTimer = function (minutes, seconds) {
        timerMinutes = minutes;
        timerSeconds = seconds;
    };

    /*
    * Decrements the timer
    */
    that.decrementTimer = function () {
        if (timerSeconds != 0) {
            timerSeconds--;
        }
        else if (timerMinutes != 0) {
            timerMinutes--;
            timerSeconds = 59;
        }
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

};

module.exports = GameControl;