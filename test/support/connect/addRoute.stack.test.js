var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest-as-promised' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' );

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router;

    beforeEach(function () {
        var _ = helper();

        app = _.app;
        router = _.router;
    });

    describe( "router.addRoute", function () {

        it( "options.stack as function", function () {

            router.addRoute({
                url: '/',
                stack: function ( req, res, next ) {
                    res.response += 'hello';
                    next();
                },
            });

            return request( app )
            .get( '/' )
            .expect( 200, JSON.stringify({
                url: '/',
                response: 'hello'
            }));

        });

        it( "options.stack as an array of functions", function () {

            router.addRoute({
                url: '/',
                stack: [
                    function ( req, res, next ) {
                        res.statusCode = 200;

                        next();
                    },
                    function ( req, res, next ) {
                        res.response += '-';

                        next();
                    },
                    function ( req, res, next ) {
                        res.response += '.';

                        next();
                    },
                    function ( req, res, next ) {
                        res.response += '-';

                        next();
                    },
                ]
            });

            return  request( app )
            .get( '/' )
            .expect( 200, JSON.stringify({
                url: '/',
                response: '-.-'
            }));

        });

        it( "shouldn't pass to another route unless we specify", function () {

            router.get( '/', function ( req, res, next ) {
                res.response += "hey";
                next();
            });

            router.get( '/', function ( req, res, next ) {
                res.response += "shouldn't run";
                next();
            });

            return request( app )
            .get( '/' )
            .expect( 200, JSON.stringify({
                url: '/',
                response: 'hey'
            }));
        });

        it( "should pass to another route if we specify", function () {

            router.get( '/', function ( req, res, next ) {
                res.response += "hey";
                next( 'route' );
            });

            router.get( '/', function ( req, res, next ) {
                res.response += "wigglewiggle";
                next();
            });

            return request( app )
            .get( '/' )
            .expect( 200, JSON.stringify({
                url: '/',
                response: 'heywigglewiggle'
            }));
        });
    });

});
