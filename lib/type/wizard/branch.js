var Util = require( 'findhit-util' ),
    Step = require( './step' );

// -----------------------------------------------------------------------------

function Branch ( ConstructedRoute, parentBranch, name, options ) {


    bind( this, 'ConstructedRoute', ConstructedRoute );
    bind( this, 'parentBranch', parentBranch || null );

    this.options = options;
    this.name = options.name || name;

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

    var steps = ! parentBranch ? options : options.steps;

    for( var name in steps ) {

        if( // Branch detection
            Util.is.Object( steps[ name ] ) &&

            (
                steps[ name ].type === 'branch' ||
                (
                    Util.is.Array( steps[ name ].steps ) ||
                    Util.is.Object( steps[ name ].steps )
                )
            )

        ) {
            new Branch( ConstructedRoute, this, name, steps[ name ] );
        } else {
            new Step( ConstructedRoute, this, name, steps[ name ] );
        }
    }

    return this;
};

// Export Branch
module.exports = Branch;


/* private methods */

function bind ( object, key, value ) {
    Object.defineProperty( object, key, {
        enumerable: false,
        writable: false,
        value: value,
    });
};
