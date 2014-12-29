var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------

var Branch = function ( ConstructedRoute, parentBranch, name, options ) {
    this.ConstructedRoute = ConstructedRoute;
    this.parentBranch = parentBranch || null;
    this.options = options;

    // It should be only active it is the root branch
    this.active = ! parentBranch;
    this.steps = [];

    this.parseSource( options );

    var id;
    Object.defineProperty( this, 'id', {
        writable: false,

        get: function () {
            if( ! parentBranch ) return 'root';
            if( id ) return id;

            id = [ self.name ]; var parentBranch = branch;

            while( parentBranch ) {
                id.unshift( parentBranch.name );
                parentBranch = parentBranch.parentBranch;
            }

            id.push( name );

            return ( id = id.join('/') );
        },
    });

    // Add this instance into ConstructedRoute.branches
    ConstructedRoute.branches.push( this );
    ConstructedRoute.branches[ id ] = this;

    return this;
};

// Export Branch
module.exports = Branch;

/* class methods */

/* instance methods */
Branch.prototype.parseSource = function ( options ) {
    if( this._parsed ) return false;



    return ( this._parsed = true );
}

Branch.prototype.activate = function () {
    this.active = true;
};

Branch.prototype.deactivate = function () {
    this.active = false;
};
