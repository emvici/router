var Route = require( '../route' );

// -----------------------------------------------------------------------------

var SimpleRoute = function () {
    throw new Error([

        "You can't use SimpleRoute directly to construct a new SimpleRoute.",
        "Please use SimpleRoute.construct method instead"

    ].join(" "));
};

// Extend SimpleRoute prototype from Route prototype
SimpleRoute.prototype = Object.create( Route.prototype );

/* class methods */
SimpleRoute.construct = function ( options ) {

    var RouteSimpleConstructor = function () {
        return this;
    };

    // Extend its prototype from SimpleRoute prototype
    RouteSimpleConstructor.prototype = Object.create( SimpleRoute.prototype );

    // Set stack that route will execute
    RouteSimpleConstructor.stack = [];

};

/* instance methods */

SimpleRoute.prototype.dispatch = function ( req, res, next ) {

};
