var connect = require( 'connect' ),
    Router = require( '../../../lib/router' );

module.exports = function ( options ) {
    var _ = {};

    _.app = connect();
    _.router = new Router( options );

    // Simulate a session middleware
    _.app.use(function ( req, res, next ) {
        req.session = {};
        next();
    });

    // Use router
    _.app.use( _.router );

    // Error handler
    _.app.use(function ( err, req, res, next ) {
        res.statusCode = err.code || 500;
        res.write( err.toString() || 'Internal Error' );
        res.end();
    });

    return _;
};
