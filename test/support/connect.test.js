var Util = require( 'findhit-util' ),

    connect = require( 'connect' ),
    constructor = require( '../../index' ),

    Route = require( '../../lib/route' ),

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

        // Error handler
        app.use(function ( err, req, res, next ) {
            res.statusCode = err.code;
            res.write( err.name );
            res.end();
        });

    });

    describe( "routes", function () {

        describe( ".[method]", function () {
            Util.Array.each( Route.METHODS, function ( method, i ) {
                var methodName = method.toLowerCase();

                describe( "." + methodName, function () {

                    it( "should work with a single function", function ( done ) {
                        router[ methodName ]( '/', function ( req, res, next ) {
                            res.statusCode = 200;
                            res.write( req.method );
                            res.end();
                        });

                        request( app )
                            [ methodName ]( '/' )
                            .expect( 200, method, done );
                    });

                    it( "shouldn't work with different method", function ( done ) {
                        var reqMethod = Route.METHODS[ Route.METHODS.length === i + 1 ? 0 : i + 1 ],
                            reqMethodName = reqMethod.toLowerCase();

                        router[ methodName ]( '/', function ( req, res, next ) {
                            res.statusCode = 200;
                            res.write( req.method );
                            res.end();
                        });

                        request( app )
                            [ reqMethodName ]( '/' )
                            .expect( 404, 'NotFoundError', done );
                    });

                });

            });
        });

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

                describe( "register", function () {

                    before(function () {
                        router.addRoute({
                            url: '/register',
                            steps: {

                                tos: {
                                    title: "Terms and Conditions",

                                    stack: function () {

                                    },

                                    post: function ( req, res ) {
                                        return true;
                                    },
                                },

                                identity: {
                                    title: "Who are you?",

                                    stack: function () {

                                    },

                                    post: function ( req, res ) {
                                        return true;
                                    },
                                },

                                internationalization: {
                                    title: "Internationalization",

                                    stack: function () {

                                    },

                                    post: function ( req, res ) {
                                        return true;
                                    },
                                },

                                credentials: {
                                    title: "Credentials",

                                    stack: function () {

                                    },

                                    post: function ( req, res ) {
                                        return true;
                                    },
                                },

                                congratulations: {
                                    title: "Congrats!!!1",

                                    stack: function () {

                                    },

                                    post: function () {

                                    },
                                },

                            },
                        });
                    });



                });

            });

        });


    });

});
