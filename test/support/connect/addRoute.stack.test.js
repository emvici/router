var Util = require( 'findhit-util' ),

Route = require( '../../../lib/route' ),

request = require( 'supertest' ),
sinon = require( 'sinon' ),
chai = require( 'chai' ),
expect = chai.expect,

helper = require( './_' );


describe( "support connect", function () {
    var app, router;

    beforeEach(function () {
        var _ = helper();

        app = _.app;
        router = _.router;
    });

    describe( "router.addRoute", function () {

        it( "options.stack as function", function ( done ) {

            router.addRoute({
                url: '/',
                stack: function ( req, res, next ) {
                    res.statusCode = 200;
                    res.write( req.url );
                    res.end();
                },
            });

            request( app )
                .get( '/' )
                .expect( 200, '/', done );

        });

        it( "options.stack as an array of functions", function ( done ) {

            router.addRoute({
                url: '/',
                stack: [
                function ( req, res, next ) {
                    res.statusCode = 200;

                    next();
                },
                function ( req, res, next ) {
                    res.write( '-' );

                    next();
                },
                function ( req, res, next ) {
                    res.write( '.' );

                    next();
                },
                function ( req, res, next ) {
                    res.write( '-' );

                    res.end();
                },
                ]
            });

            request( app )
                .get( '/' )
                .expect( 200, '-.-', done );

        });
    });

});
