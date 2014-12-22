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

    options = Util.is.Object( options ) && Util.extend( {}, options ) || {};

    /*
        This method will try to detect options for routes and then proxy
        arguments into a specific route type's constructor.

        If this can't gather a route type, it will default as 'stack'.
    */

    options.type = options.type || 'stack';

    var TypeRoute = Route.TYPES[ options.type ];

    if( ! TypeRoute ) {
        throw new TypeError( "options.type provided doesn't exist!" );
    }

    var ConstructedRoute = function ( req, res, nextRoute ) {

        // Link things to route
        this.req = req;
        this.res = res;
        this.nextRoute = nextRoute;

        // Link route into things
        req.route = this;

    };

    ConstructedRoute.match = TypeRoute.match;

    ConstructedRoute.prototype = Object.create( TypeRoute.prototype );
    ConstructedRoute.prototype.options = options;
    options.__proto__ = TypeRoute.construct.defaultOptions || Route.construct.defaultOptions;

    TypeRoute.construct( ConstructedRoute );

    // I don't know yet if we need to inject things after a Route construction.
    // Placed on ConstructedRoute just in case we need it...

    return ConstructedRoute;
};

Route.construct.defaultOptions = {
    type: 'stack',
    method: undefined,
    prerequisites: undefined,
};

/* constants */

Route.TYPES = require( './type' );
Route.METHODS = [ 'GET', 'POST', 'PUT', 'DELETE' ];
Route.PREREQUESITES = {};

/* instance methods */
Route.prototype.dispatch = function () {
    throw new Error([
        "Are you constructing a new Router Type?",
        "It seems that you didn't placed .dispatch on it's prototype..."
    ].join(" "));
};
