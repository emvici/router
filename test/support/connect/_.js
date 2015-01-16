var connect = require( 'connect' ),
    Router = require( '../../../lib/router' ),
    session = require( 'express-session' );

module.exports = function ( options ) {
    var _ = {};

    _.app = connect();
    _.router = new Router( options );

    // Use session
    _.app.use( session({ secret: 'test', resave: false, saveUninitialized: true }) );

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
