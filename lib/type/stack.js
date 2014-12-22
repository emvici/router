var Util = require( 'findhit-util' ),
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

    // Set stack that route will execute
    ConstructedRoute.stack = ConstructedRoute.prototype.stack = [];

    // TODO:
    // Populate stack

};

StackRoute.match = function ( req, res ) {
    return true;
};

/* instance methods */

StackRoute.prototype.dispatch = function () {

    if( this.stack.length === 0 ) {
        return this.nextRoute();
    }

    var i = 0;

    // execute stack
    var next = function ( what ) {
        if( what === 'route' ) {
            return this.nextRoute();
        }

        if( Util.is.Error( what ) ) {
            return this.nextRoute( what );
        }

        while ( i < this.stack.length ) {
            try {
                var res = this.stack[ i ].call( this, this.req, this.res, this.next );

                if ( res && res.then ) {
                    Promise.cast( res ).then(this.next , this.nextRoute );
                } else if( res ) {
                    this.next();
                }

            } catch ( err ) {
                this.nextRoute( err );
            }

            return;
        }

        this.nextRoute();
    };

    this.next = next.bind( this );
    next.call( this );
};
