var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------
// Data handles wizard data into session

function Data ( route ) {
    var session = route.req[ route.router.options.reqSessionKey ];

    // If there isn't a `wiz` object on session, just add it
    if( ! session.wiz ) {
        session.wiz = {};
    }

    // Save route on this instance
    this.route = route;

    // Gather session from session, or just create a new one
    this.session = session.wiz[ route.id ] || ( session.wiz[ route.id ] = {} );

    // Add a control variable for changed state
    this.changed = false;

    return this;
};

// Export Data
module.exports = Data;

/* instance methods */

Data.prototype.currentStep = function ( step ) {

    // If there is no `step` provided, it means that we wan't to get!

    // Otherwise, lets set it!
};
/*
Data.prototype.save = function () {

};

Data.prototype.destroy = function () {

};
*/
Data.prototype.getFromStep = function ( step ) {

};
