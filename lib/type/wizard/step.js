var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------

var Step = function ( ConstructedRoute, branch, name, options ) {
    this.ConstructedRoute = ConstructedRoute;
    this.branch = branch;
    this.options = options;
    this.parseSource( options );

    this.id = branch ? branch.id + '/' + this.name;

    // Add this instance into ConstructedRoute.branches
    ConstructedRoute.steps.push( this );
    ConstructedRoute.steps[ this.id ] = this;

    return this;
};

// Export Step
module.exports = Step;

/* instance methods */

Step.prototype.parseSource = function ( options ) {

    // Insert attributes on step
    this.id = this._genId( this.name, this.branch );
    this.branch = branch;
    this.url = o.url[0] +'/'+ this.id;

    // Set defaults
    this.title = ( this.title ) && this.title || this.name;
    this.menuTitle = ( this.menuTitle ) && this.menuTitle || this.title;
    this.subTitle = ( this.subTitle ) && this.subTitle || "";

    // Get process fns
    var fnName = this.fnName = ( o.prefix || '' ) + Util.String.fromDashToCamel( this.id.replace('/','-') ),

    fn = this.fn = ( typeof o.controller[ fnName ] == 'function' ) && o.controller[ fnName ] || F.Route.Wizard._defaultAction,
    fnPost = this.fnPost = ( typeof o.controller[ fnName + 'Post' ] == 'function' ) && o.controller[ fnName + 'Post' ] || F.Route.Wizard._defaultActionPost;

};
