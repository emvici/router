var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------
// Store handles wizard session store

function Store ( route ) {

    // Save route on this instance
    Object.defineProperty( this, 'route', {
        enumerable: false,
        writable: false,
        value: route;
    });

    this.useOrAppend();

    // Check for steps data object
    this.data = Util.is.Object( this.data ) && this.data || {};

    // Active branches
    this.activeBranches = Util.is.Array( this.activeBranches ) && this.activeBranches || [];

    // Processed steps
    this.processedSteps = Util.is.Array( this.processedSteps ) && this.processedSteps || [];

    // Current step
    this.current = Util.is.String( this.current ) && this.current || null;

};

// Export Store
module.exports = Store;

/* instance methods */


Store.prototype.branched = function( branch ) {
    return this.activeBranches.indexOf( branch ) !== -1;
};

Store.prototype.branch = function( branch ) {
    if( this.activeBranches.indexOf( branch ) !== -1 ) {
        return false;
    }

    this.activeBranches.push( branch );

    return true;
};

Store.prototype.unbranch = function( branch ) {
    var i;

    if( ( i = this.activeBranches.indexOf( branch ) ) === -1 ) {
        return false;
    }

    this.activeBranches.splice( i, 1 );

    return true;
};

Store.prototype.processed = function( step ) {
    return this.processedSteps.indexOf( step ) !== -1;
};

Store.prototype.process = function ( step ) {
    if( this.processedSteps.indexOf( step ) !== -1 ) {
        return false;
    }

    this.processedSteps.push( step );

    return true;
};

Store.prototype.unprocess = function( step ) {
    var i;

    if( ( i = this.processedSteps.indexOf( step ) ) === -1 ) {
        return false;
    }

    this.processedSteps.splice( i, 1 );

    return true;
};

Store.prototype.currentStep = function ( step ) {

    // If there is no `step` provided, it means that we wan't to get it!
    if( ! step ) {
        return this.current;
    }

    // Otherwise, lets set it!
    this.current = step;

};

Store.prototype.useOrAppend = function () {

    var route = this.route,
        req = route.req,
        session = req[ route.router.options.reqSessionKey ],
        wizardsOnThisSession =
            Util.is.Object( session.wizards ) && session.wizards ||
            ( session.wizards = {} );

    // If there is already a session for this wizard route
    if( wizardsOnThisSession[ route.id ] ) {
        // Extend this store with it
        Util.extend( this, wizardsOnThisSession[ route.id ] );
    }

    // Then, ALWAYS, wither if it exists or not, bind this store into session
    wizardsOnThisSession[ route.id ] = this;

};

Store.prototype.destroy = function () {

    var route = this.route,
        req = route.req,
        session = req[ route.router.options.reqSessionKey ],
        wizardsOnThisSession =
            Util.is.Object( session.wizards ) && session.wizards ||
            ( session.wizards = {} );

    delete wizardsOnThisSession[ route.id ];

};
