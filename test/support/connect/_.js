var connect = require( 'connect' ),
    Router = require( '../../../lib/router' ),
    session = require( 'express-session' );

module.exports = function ( options ) {
    var _ = {};

    _.app = connect();
    _.router = new Router( options );

    // Use session
    _.app.use( session({ secret: 'test', resave: false, saveUninitialized: true }) );

    // Add a response appender
    _.app.use( function ( req, res, next ) {
        res.append = '';

        next();
    });

    // Use router
    _.app.use( _.router );

    // In case we didn't ended, we want to end with appended result
    _.app.use( function ( req, res, next ) {
        if( ! res.finished ) {
            res.end( res.append );
        }
    });

    // Error handler
    _.app.use(function ( err, req, res, next ) {
        res.statusCode = err.code || 500;
        res.write( err.toString() || 'Internal Error' );
        res.end();
    });

    return _;
};
