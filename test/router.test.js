var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Router = require( '../lib/router' ),
    Route = require( '../lib/route' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

// -----------------------------------------------------------------------------

describe( "Router", function () {
    var router;

    beforeEach(function () {
        router = new Router();
    });

    describe( ".[method]", function () {


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

    describe( ".addRoute", function () {

        it( "should return a class that creates instances of Route compatible class", function () {

            var CustomRoute = router.addRoute({
                url: '/',
                stack: function () { return true; },
            });

            var route = new CustomRoute( router, function () {}, CustomRoute.paths[0], { url: '/' }, {} );

            expect( route instanceof Route ).to.be.ok();

        });

    });

    describe( ".addRoutes", function () {

        it( "should return an array with classes that creates instances of Route compatible class", function () {

            var CustomRoutes = router.addRoutes([
                {
                    url: '/',
                    stack: function () { return true; },
                },
                {
                    url: '/',
                    stack: function () { return true; },
                }
            ]);

            var routeOne = new CustomRoutes[0]( router, function () {}, CustomRoutes[0].paths[0], { url: '/' }, {} ),
                routeTwo = new CustomRoutes[1]( router, function () {}, CustomRoutes[1].paths[0], { url: '/' }, {} );

            expect( routeOne instanceof Route ).to.be.ok();
            expect( routeTwo instanceof Route ).to.be.ok();

        });

    });


});
