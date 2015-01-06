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

    Util.Array.each( Route.METHODS, function ( method, i ) {
        var methodName = method.toLowerCase();

        describe( "router." + methodName, function () {

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
                    .expect( 404, 'NotFoundError: No route was matched', done );
            });

        });

    });

});
