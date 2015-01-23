var Util = require( 'findhit-util' ),
    Stack = require( 'stack-queue' );

// -----------------------------------------------------------------------------

function Step ( ConstructedRoute, branch, name, options ) {

    bind( this, 'ConstructedRoute', ConstructedRoute );
    bind( this, 'branch', branch );

    this.options = options;
    this.name = options.name || name;

    this.id = branch.id !== 'root' ? branch.id + '/' + this.name : this.name;
    this.url = ConstructedRoute.basePath + '/' + this.id;

    this.title = options.title || this.name;
    this.menuTitle = options.menuTitle || this.title;
    this.subTitle = options.subTitle || "";

    this.prepare = new Stack().queue(
        Util.is.Array( options.prepare ) && options.prepare ||
        Util.is.Function( options.prepare ) && [ options.prepare ] ||
        []
    );

    this.process = new Stack().queue(
        Util.is.Array( options.process ) && options.process ||
        Util.is.Function( options.process ) && [ options.process ] ||
        []
    );

    // Add this instance into ConstructedRoute.branches
    ConstructedRoute.steps.push( this );
    ConstructedRoute.steps[ this.id ] = this;

    branch.steps.push( this );
    branch.steps[ this.id ] = this;

    return this;
};

// Export Step
module.exports = Step;

/* instance methods */

/* private methods */

function bind ( object, key, value ) {
    Object.defineProperty( object, key, {
        enumerable: false,
        writable: false,
        value: value,
    });
};
