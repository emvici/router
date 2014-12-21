var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------

var Route = function () {
    throw new Error([

        "You can't use Router directly to construct a new Route.",
        "Please use Route.construct method or [Type]Route.construct instead"

    ].join(" "));
};

// Export Route
module.exports = Route;

/* class methods */

Route.construct = function ( options ) {

    options = Util.is.Object( options ) && options || {};

    /*
        This method will try to detect options for routes and then proxy
        arguments into a specific route type's constructor.

        If this can't gather a route type, it will default as 'simple'.
    */

    options.type = options.type && Route.TYPES[ options.type ] || 'simple';

    var ConstructedRoute = Route.TYPES[ options.type ].construct( options );

    // I don't know yet if we need to inject things after a Route construction.
    // Placed on ConstructedRoute just in case we need it...

    return ConstructedRoute;
};

Route.construct.defaultOptions = {
    type: 'simple',
    method: undefined,
    prerequisites: undefined,
};

/* constants */

Route.TYPES = {};
Route.METHODS = [ 'GET', 'POST', 'PUT', 'DELETE' ];
Route.PREREQUESITES = {};

/* instance methods */
Route.prototype.dispatch = function () {
    throw new Error([
        "Are you constructing a new Router Type?",
        "It seems that you didn't placed .dispatch on it's prototype..."
    ].join(" "));
};
