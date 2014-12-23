var Util = require( 'findhit-util' ),
    Error = require( './error' ),
    Route = require( './route' ),

    debug = require( 'debug' )( 'emvici-router:router' );

// -----------------------------------------------------------------------------

var Router = function ( options ) {

    this.options = Util.is.Object( options ) && options || {};
    this.options.__proto__ = Router.defaultOptions;

    // Init routes array, this will save all router configuration
    this.Routes = [];

    // state defaults
    this.state
};

Router.defaultOptions = {
    reqSessionKey: 'session',
};

// Handler that will be used on this middleware
Router.prototype.handle = function ( req, res, outcb ) {

    debug( "Handling a new request", req.method, req.url );

    // If req doesn't have a session, this plugin should NOT work, throw Error!
    if(
        Util.isnt.Object(
            req[ this.options.reqSessionKey ]
        )
    ) {
        throw new TypeError([
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

    var i = -1,
        handled = false,
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
            out( err );
            return;
        }

        try {
            while ( i < Routes.length ) {
                var Route = Routes[ i++ ];

                if( ! Route ) {
                    break;
                }

                // Try to match route
                var validPath = Route.match( req, res );

                if( ! validPath ) {
                    continue;
                }

                debug( "Found Route with valid path", Route, validPath );

                var route = new Route( validPath, req, res, nextRoute );

                route.dispatch();
            }
        } catch( err ) {
            out( err );
            return;
        }

        // In case no Route was found
        debug( "It seems that no route was matched, giving up with 404 error" );
        out( new Error.NotFound( "No route was matched" ) );
    }

    nextRoute();
};

Router.prototype.addRoute = function ( options ) {
    var ConstructedRoute = Route.construct( options );

    this.Routes.push( ConstructedRoute );

    return ConstructedRoute;
};

Router.prototype.addRoutes = function ( routesOptions ) {
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

    return this.addRoute( options );
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
