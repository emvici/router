var Route = require( '../../route' );

// -----------------------------------------------------------------------------

var WizardRoute = function () {
    throw new Error([

        "You can't use WizardRoute directly to construct a new WizardRoute.",
        "Please use WizardRoute.construct method instead"

    ].join(" "));
};

// Export WizardRoute
module.exports = WizardRoute;

// Extend WizardRoute prototype from Route prototype
WizardRoute.prototype = Object.create( Route.prototype );

/* class methods */

WizardRoute.construct = function ( ConstructedRoute ) {
    var options = ConstructedRoute.options;

    this.branches = [];
    this.steps = [];

    this.root = new Branch( ConstructedRoute, null, 'root', options.steps );

    /*Util.Array.each( options.url, function ( url ) {
        ConstructedRoute.paths.push(
            //new Path( url )
        );
    });*/

    // Guess which step we are
    // Run step stack


};

/* instance methods */

WizardRoute.prototype.dispatch = function () {

    // If req doesn't have a session, this route type should NOT work, throw Error!
    if( ! req[ this.options.reqSessionKey ] ) {
        throw new TypeError([
            "emvici-router/lib/type/wizard needs some kind of session.",
            "You should use some session middleware before `.use` emvici-router.",
            "In case you have one and it doesn't place it at `req.session`, please",
            "specify in which key it sits by giving `reqSessionKey` option to",
            "emvici-router constructor options.",

            "Example: `var router = require( 'emvici-router' )({ reqSessionKey: 'YOLO' })`"
        ].join( " " ));
    }

    // Check step
};

WizardRoute.prototype.saveSession = function () {
    var req = this.req,
        session = req[ this.router.options.reqSessionKey ],
        changed = false;


};

WizardRoute.prototype.destroySession = function () {
    var req = this.req,
        session = req[ this.router.options.reqSessionKey ],
        changed = false;



};
