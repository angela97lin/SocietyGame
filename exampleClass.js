//Classes are functions in js
//You can make a constructor by putting parameters in the function
//These parameters will be fields
var ClassObject = function(param) {

	//This must be here
	var that = Object.create(ClassObject.prototype);

	//Define additional fields that aren't in the constructor like so
	var field;

	/**
	* Here is how you define instance methods
	* Remember to JSDoc
	*
	* @param {Type} param - the parameter of the function
	*/
	that.instanceMethod = function(param) {
		//do something
	};

	//This ensures that fields within the class cannot be manipulated
	//Always include this to prevent rep exposure
	Object.freeze(that);

	//Always include this
	return that;

};