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
                    res.write( req.path || req.url );
                    res.end();

                    next();
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

        it( "shouldn't pass to another route unless we specify", function ( done ) {

            router.get( '/', function ( req, res, next ) {
                res.write('hey');
                next();
            });

            router.get( '/', function ( req, res, next ) {
                res.write("shouldn't run");
                next();
            });

            app.use(function ( req, res ) {
                res.end();
            })

            request( app )
                .get( '/' )
                .expect( 200, 'hey', done );

        });

        it( "should pass to another route if we specify", function ( done ) {

            router.get( '/', function ( req, res, next ) {
                res.write('hey');
                next( 'route' );
            });

            router.get( '/', function ( req, res, next ) {
                res.write("honney");
                next();
            });

            app.use(function ( req, res ) {
                res.end();
            })

            request( app )
                .get( '/' )
                .expect( 200, 'heyhonney', done );

        });
    });

});
