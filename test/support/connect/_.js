var connect = require( 'connect' ),
    Router = require( '../../../lib/router' ),
    ReqResTify = require( 'emvici-reqres-tify' ),
    session = require( 'express-session' );

module.exports = function ( options ) {
    var _ = {};

    _.app = connect();
    _.router = new Router( options );

    _.app.use( ReqResTify() );

    // Use session
    _.app.use( session({ secret: 'test', resave: false, saveUninitialized: true }) );

    // Initiate res.response
    // So we can increment string
    _.app.use(function ( req, res, next ) {
        res.response = '';
        next();
    });

    // Use router
    _.app.use( _.router );

    // Success handler
    _.app.use(function render ( req, res, next ) {
        var payload = {
            url: req.route && req.route.url || false,
            response: res.response || null,
        };

        res.statusCode = 200;
        res.write( JSON.stringify( payload ) );
        res.end();
    });

    // Error handler
    _.app.use(function error_handler ( err, req, res, next ) {
        res.statusCode = err.code || 500;
        res.write( err.toString() || 'Internal Error' );
        res.end();
    });

    return _;
};
