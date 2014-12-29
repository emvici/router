var Util = require( 'findhit-util' ),

    debug = require( 'debug' )( 'emvici-router:route' );

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

    options.url =
        Util.is.Array( options.url ) && options.url ||
        (
            Util.is.String( options.url ) ||
            Util.is.RegExp( options.url )
        ) && [ options.url ] ||
        [];

    if( options.url.length === 0 ) {
        throw new TypeError( "It seems that options.url doesn't have urls..." );
    }

    var TypeRoute = Route.TYPES[
        options.type = options.type || 'stack'
    ];

    if( ! TypeRoute ) {
        throw new TypeError( "options.type provided doesn't exist!" );
    }

    // Before constructing a new Route, proto options by default Type
    options.__proto__ = TypeRoute.construct.defaultOptions || Route.construct.defaultOptions;

    var ConstructedRoute = function ( router, nextRoute, matchedPath, req, res ) {

        this.options = Object.create( ConstructedRoute.options );

        // Current path filtering
        this.path = matchedPath;

        // Link things to route
        this.req = req;
        this.res = res;
        this.nextRoute = nextRoute;

        // Link route into things
        req.route = this;

        // TODO: parse params from path

    };

    // define methods
    ConstructedRoute.methods =
        Util.is.Array( options.methods ) && options.methods ||
        Util.is.String( options.methods ) && [ options.methods ] ||
        Util.is.String( options.method ) && [ options.method ] ||
        Route.METHODS;

    ConstructedRoute.paths = [];
    ConstructedRoute.match = Route.match;
    ConstructedRoute.options = options;

    ConstructedRoute.prototype = Object.create( TypeRoute.prototype );

    // Allow TypeRoute to manipulate ConstructedRoute
    TypeRoute.construct( ConstructedRoute );

    return ConstructedRoute;
};

Route.construct.defaultOptions = {
    type: 'stack',
    method: undefined,
    prerequisites: undefined,
};

Route.match = function ( req, res ) {

    // Check if req.method is a valid one
    if( this.methods.indexOf( req.method ) === -1 ) {
        return false;
    }

    // Now, since we only need a path to match this route
    // Return the first valid path we found
    for( var i in this.paths ) {
        if( this.paths[ i ].match( req.url ) ) {
            return this.paths[ i ];
        }
    }

    // Otherwise, sorry...
    return false;
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
