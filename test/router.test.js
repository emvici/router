var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Router = require( '../lib/router' ),
    Route = require( '../lib/route' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

// -----------------------------------------------------------------------------

describe( "Router", function () {

    describe( ".[method]", function () {
        var router = new Router();

        Util.Array.each( Route.METHODS, function ( method ) {
            var methodName = method.toLowerCase();

            describe( "." + methodName, function () {

                it( "should present an error if no url is specified", function () {
                    expect(function () {
                        router[ methodName ]();
                    }).to.throw( TypeError, "first argument should be a String or Regexp" );
                });

                it( "should present an error if no function is specified", function () {
                    expect(function () {
                        router[ methodName ]( '/some/url' );
                    }).to.throw( TypeError, "It seems that you didn't provided any function" );
                });

            });

        });

    });


});
