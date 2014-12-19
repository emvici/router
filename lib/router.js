var Route = require( './route' );

var Router = function ( options ) {

    // Init routes array, this will save all router configuration
    this.routes = [];

};

Router.defaultOptions = {

};

// Export Router
module.exports = Router;
