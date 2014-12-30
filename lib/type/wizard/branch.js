var Util = require( 'findhit-util' ),
    Step = require( './step' );

// -----------------------------------------------------------------------------

var Branch = function ( ConstructedRoute, parentBranch, name, options ) {
    this.ConstructedRoute = ConstructedRoute;
    this.parentBranch = parentBranch || null;
    this.options = options;
    this.name = options.name || name;

    // It should be only active it is the root branch
    this.active = ! parentBranch;

    Object.defineProperty( this, 'id', {
        enumerable: true,
        writable: false,
        value:
            ! parentBranch && 'root' ||
            (function ( id ) {
                var lastBranch = parentBranch;


                while( lastBranch && lastBranch.name !== 'root' ) {
                    id.unshift( lastBranch.name );
                    lastBranch = lastBranch.parentBranch;
                }

                return id.join('/');
            })([ this.name ])
    });

    // Add this instance into ConstructedRoute.branches
    if( parentBranch ) {
        ConstructedRoute.branches.push( this );
        ConstructedRoute.branches[ this.id ] = this;

        parentBranch.branches.push( this );
        parentBranch.branches[ this.id ] = this;
    }

    // Process branches and steps
    this.steps = [];
    this.branches = [];
    for( var name in options ) {
        if( options[ name ].constructor === Object && options[ name ].stack ) {
            new Step( ConstructedRoute, this, name, options[ name ] );
        } else {
            new Branch( ConstructedRoute, this, name, options[ name ] );
        }
    }

    return this;
};

// Export Branch
module.exports = Branch;

/* class methods */

/* instance methods */

Branch.prototype.activate = function () {
    this.active = true;
};

Branch.prototype.deactivate = function () {
    this.active = false;
};
