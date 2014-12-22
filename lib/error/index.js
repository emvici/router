// This will export Errors supported by emvici-router so you can use:
/*  Either on a route:

    var Error = require( 'emvici-router/lib/error' ),
        router = require( 'emvici-router' )();

    // Integration example
    router.get( '/user/:id', function ( req, res, next ) {

        if( ! ACL.test( id ) ) {
            throw new Error.Forbidden();
        }

    });

*/

/*  Or on your error handler:

    var Error = require( 'emvici-router/lib/error' ),
        router = require( 'emvici-router' )();

    // Integration example
    router.use( function ( err, req, res, next ) {

        if ( err instanceof Error.NotFound ) {
            res.render( 'error/404' );
            return;
        }

        if ( err instanceof Error.InternalError ) {
            res.render( 'error/500' );
            return;
        }

        res.render( 'error/generic' );

    });

*/

var Error = module.exports = {};

Error.BadRequest = Error[ 400 ] = require( './400-BadRequestError' );
Error.Forbidden = Error[ 403 ] = require( './403-ForbiddenError' );
Error.NotFound = Error[ 404 ] = require( './404-NotFoundError' );
Error.MethodNotAllowed = Error[ 405 ] = require( './405-MethodNotAllowedError' );
Error.InternalError = Error[ 500 ] = require( './500-InternalError' );
Error.NotImplemented = Error[ 501 ] = require( './501-NotImplementedError' );
