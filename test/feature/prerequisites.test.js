var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Router = require( '../../lib/router' ),
    Route = require( '../../lib/route' ),

    connect = require( 'connect' ),
    request = require( 'supertest' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( "params", function () {

    var router, app;

    beforeEach(function () {
        router = new Router();
        app = connect();

        app.use(function ( req, res, next ) {
            res.appended = '';
            next();
        });

        app.use( router );

        app.use(function ( req, res ) {
            res.write( res.appended );
            res.end();
        });

        app.use(function ( err, req, res, next ) {
            res.statusCode = err.code || 500;
            res.write( err.message || 'Internal Error' );
            res.end();
        });
    });

    function tests () {

        it( "should not run a route with non numeric prerequisite filter", function ( done ) {
            request( app )
            .get( '/test/prererererer' )
            .expect( 404, 'No route was matched', done );
        });

        it( "should run a route with numeric prerequisite filter", function ( done ) {
            request( app )
            .get( '/test/23' )
            .expect( 200, 'heyhey', done );
        });

    };

    describe( "prerequisite as option", function () {

        beforeEach(function () {

            router.addRoute({
                url: '/test/:one',
                prerequisites: [
                    function ( req, res, next ) {

                        Util.Object.each( req.params, function ( param ) {
                            if ( Util.isnt.Number( param ) ) {
                                throw new Error( "param "+ i +" isn't a number!" );
                            }
                        });

                        next();
                    }
                ],
                stack: function ( req, res ) {
                    res.end( 'heyhey' );
                },
            });

        });

        tests();

    });

    describe( "prerequisite as a route.PREREQUISITE", function () {

        beforeEach(function () {

            router.PREREQUISITES.numericParams = function ( req, res, next ) {

                Util.Object.each( req.params, function ( param ) {
                    if ( Util.isnt.Number( param ) ) {
                        throw new Error( "param "+ i +" isn't a number!" );
                    }
                });

                next();
            };

            router.addRoute({
                url: '/test/:one',
                prerequisites: [
                    'numericParams'
                ],
                stack: function ( req, res ) {
                    res.end( 'heyhey' );
                },
            });

        });

        tests();

    });

    describe( "prerequisite as a route.PREREQUISITE", function () {

        beforeEach(function () {

            Router.PREREQUISITES.numericParams = function ( req, res, next ) {

                Util.Object.each( req.params, function ( param ) {
                    if ( Util.isnt.Number( param ) ) {
                        throw new Error( "param "+ i +" isn't a number!" );
                    }
                });

                next();
            };

            router.addRoute({
                url: '/test/:one',
                prerequisites: [
                    'numericParams'
                ],
                stack: function ( req, res ) {
                    res.end( 'heyhey' );
                },
            });

        });

        tests();

    });


});
