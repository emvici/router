var Util = require( 'findhit-util' ),

    connect = require( 'connect' ),
    constructor = require( '../../index' ),

    request = require( 'supertest' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;


describe( "connect", function () {
    var app, router;

    beforeEach(function () {
        app = connect();
        router = constructor();

        // Simulate a session middleware
        app.use(function ( req, res, next ) {
            req.session = {};
            next();
        });

        // Use router
        app.use( router );

    });

    describe( "routes", function () {

        describe( "addRoute", function () {

            describe( "stack", function () {

                it( "stack as function", function ( done ) {

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

                it( "stack as an array of functions", function ( done ) {

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

            describe( "wizard", function () {

            });

        });


    });

});
