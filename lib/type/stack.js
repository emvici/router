var Util = require( 'findhit-util' ),
    Path = require( '../path' ),
    Route = require( '../route' ),
    Stack = require( 'stack-queue' );

// -----------------------------------------------------------------------------

var StackRoute = function () {
    throw new Error([

        "You can't use StackRoute directly to construct a new StackRoute.",
        "Please use StackRoute.construct method instead"

    ].join(" "));
};

// Export StackRoute
module.exports = StackRoute;

// Extend StackRoute prototype from Route prototype
StackRoute.prototype = Object.create( Route.prototype );

/* class methods */
StackRoute.construct = function ( ConstructedRoute ) {
    var options = ConstructedRoute.options;

    options.stack =
        Util.is.Array( options.stack ) && options.stack ||
        Util.is.Function( options.stack ) && [ options.stack ] ||
        [];

    Util.Array.each( options.url, function ( url ) {
        ConstructedRoute.paths.push(
            new Path( url )
        );
    });

    // Set stack that route will execute
    ConstructedRoute.stack = ConstructedRoute.prototype.stack = new Stack().queue( options.stack );

    // Check stack size
    if( ConstructedRoute.stack.length === 0 ) {
        throw new Error( "It seems that you didn't provide a valid options.stack" );
    }

};

/* instance methods */

StackRoute.prototype.dispatch = function () {

    this.stack.dispatch( this.req, this.res )
        .finally( this.nextRoute );

};
