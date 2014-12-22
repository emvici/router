var Util = require( 'findhit-util' ),
    Error = require( './error' ),
    Route = require( './route' );

// -----------------------------------------------------------------------------

var Router = function ( options ) {

    this.options = Util.is.Object( options ) && options || {};
    this.options.prototype = Router.defaultOptions;

    // Init routes array, this will save all router configuration
    this.Routes = [];

};

Router.defaultOptions = {
    reqSessionKey: 'session',
};

// Handler that will be used on this middleware
Router.prototype.handler = function ( req, res, outcb ) {

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

    // TODO: change proto of req and res to our own protos

    // Link things into req
    req.router = this;

    var i = 0,
        handled = false;
        out = function ( err ) {
            if( handled ) {
                throw new Error([
                    "Middleware already handled!",
                    "It seems that you've called `next` twice or more!",
                ].join(" "));
            }

            handled = true;

            return outcb( err );
        },
        Routes = this.Routes;

    var nextRoute = function ( err ) {

        // If there is an error, we should get out of this middleware!
        // So a good error handle middleware can handle it !! :D
        if( Util.is.Error( err ) ) {
            return out( err );
        }

        while ( i < routes.length ) { i++;
            var Route = Routes[ i ];

            // Try to match route
            if( ! Route.match( req, res ) ) {
                continue;
            }

            var route = new Route( req, res, nextRoute );

            try {
                route.dispatch();
            } catch( err ) {
                out( err );
            }
        }

        // It seems that no route was matched, launch an 404 error!
        out( new Error.NotFound( "No route was matched" ) );
    }

};

Router.prototype.route = function ( options ) {
    var ConstructedRoute = Route.construct( options );

    this.Routes.push( ConstructedRoute );

    return ConstructedRoute;
};

Router.prototype.routes = function ( routesOptions ) {
    return Util.Array.map( routesOptions, this.route, this );
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
