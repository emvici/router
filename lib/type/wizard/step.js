var Util = require( 'findhit-util' ),
    Stack = require( 'stack-queue' );

// -----------------------------------------------------------------------------

var Step = function ( ConstructedRoute, branch, name, options ) {
    this.ConstructedRoute = ConstructedRoute;
    this.branch = branch;
    this.options = options;
    this.name = options.name || name;

    this.id = branch.id !== 'root' ? branch.id + '/' + this.name : this.name;

    this.title = options.title || this.name;
    this.menuTitle = options.menuTitle || this.title;
    this.subTitle = options.subTitle || "";

    this.stack = new Stack().queue(
        Util.is.Array( options.stack ) && options.stack ||
        Util.is.Function( options.stack ) && [ options.stack ] ||
        []
    );

    // Check stack size
    if( this.stack.length === 0 ) {
        throw new Error( "It seems that you didn't provide a valid options.stack" );
    }

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
Step.prototype.dispatch = function () {
    return this.stack.dispatch();
};
