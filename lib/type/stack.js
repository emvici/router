var Util = require( 'findhit-util' ),
    Path = require( '../path' ),
    Route = require( '../route' );

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
    ConstructedRoute.stack = ConstructedRoute.prototype.stack = [];

    // Populate stack by options
    Util.Array.each( options.stack, function ( fn ) {
        if( Util.is.Function( fn ) ) {
            ConstructedRoute.stack.push( fn );
        }
    });

    // Check stack size
    if( ConstructedRoute.stack.length === 0 ) {
        throw new Error( "It seems that you didn't provide a valid options.stack" );
    }

};

StackRoute.match = function ( req, res ) {
    return true;
};

/* instance methods */

StackRoute.prototype.dispatch = function () {

    var i = -1;

    // execute stack
    var next = function ( err ) {
        if( err === 'route' ) {
            this.nextRoute();
            return;
        }

        if( Util.is.Error( err ) ) {
            this.nextRoute( err );
            return;
        }

        while ( i < this.stack.length ) { i++;
            var fn = this.stack[ i ];

            if( ! fn ) {
                this.nextRoute();
                return;
            }

            try {
                var res = fn.call( this, this.req, this.res, this.next );

                if ( res && res.then ) {
                    Promise.cast( res ).then( this.next , this.next );
                } else if( res ) {
                    this.next();
                }

            } catch ( err ) {
                this.next( err );
            }

            return;
        }

        this.nextRoute();
    };

    this.next = next.bind( this );
    next.call( this );
};
