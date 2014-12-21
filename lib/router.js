var Util = require( 'findhit-util' ),
    Route = require( './route' );

// -----------------------------------------------------------------------------

var Router = function ( options ) {

    this.options = Util.is.Object( options ) && options || {};
    this.options.prototype = Router.defaultOptions;

    // Init routes array, this will save all router configuration
    this.routes = [];

};

Router.defaultOptions = {
    reqSessionKey: 'session',
};

// Handler that will be used on this middleware
Router.prototype.handler = function ( req, res, next ) {

    // If req doesn't have a session, this plugin should NOT work, throw Error!
    if( ! req[ reqSessionKey ] ) {
        throw new Error([
            "emvici-router needs some kind of session.",
            "You should use some session middleware before emvici-router.",
            "In case you have one and doesn't place at `req.session`, please",
            "specify in which key it sits by giving `reqSessionKey` to",
            "emvici-router constructor options."
        ].join( " " ));
    }

    // Link things into req
    req.router = this;

    try{



    } catch( err) {
        // We should use next for error handling!! :)
        next( err );
    }

};

Router.prototype.route = function ( options ) {
    var ConstructedRoute = Route.construct( options );

    this.routes.push( ConstructedRoute );

    return ConstructedRoute;
};

var methodConstruction = function ( method, args ) {

    // If there isn't url, throw an error
    if ( Util.isnt.String( args[0] ) && Util.isnt.RegExp( args[0] ) ) {
        throw new TypeError( "first argument should be a String or Regexp" );
    }

    var options = {
        url: [ args[0] ],
        method: method,
        steps: [],
    };

    // We have to check arguments for functions
    for( var i = 1; i < args.length; i++ ) {
        if( typeof args[ i ] == 'function' ) {
            options.steps.push( args[ i ] );
        }
    }

    // If there aren't step functions, throw error
    if( options.steps.length === 0 ) {
        throw new TypeError( "It seems that you didn't provided any function" );
    }

    return this.route( options );
};

// Inject function proxying
Util.Array.each( Route.METHODS, function ( method ) {

    /*
        http method will be always uppercase, so we need to lower case it to be
        presented as a good method name
    */
    var methodName = method.toLowerCase();

    Router.prototype[ methodName ] = function () {
        return methodConstruction.call( this, method, arguments );
    };

});

// Export Router
module.exports = Router;
