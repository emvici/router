var Route = require( '../route' );

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

WizardRoute.match = function ( req, res ) {
    return true;
};
