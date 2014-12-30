var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Route = require( '../../lib/route' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( "WizardRoute", function () {
    var route;

    before(function () {
        route = Route.construct({
            url: '/buy/breakfast',
            type: 'wizard',
            steps: {
                menu: { // step
                    stack: sinon.spy(),
                },
                drink: { // step
                    stack: sinon.spy(),
                },
                snacks: { // branch

                    chicken: { // branch

                        wings: { // step
                            stack: sinon.spy(),
                        },

                        peitinho: { // step
                            stack: sinon.spy(),
                        },

                    },

                    fromage: { // step
                        stack: sinon.spy(),
                    },
                },
                delivery: { // step
                    stack: sinon.spy(),
                }
            },
        });
    });

    it( "should have 6 steps", function () {
        expect( route.steps ).to.have.length( 6 );
    });

    it( "should have 2 branches", function () {
        expect( route.branches ).to.have.length( 2 );
    });

    describe( ".match", function () {
        var shouldBe = function ( match, url ) {
            it( "should" + ( match ? " NOT " : " " ) + "work with " + url, function () {
                var ex = expect( route.match( url, 'GET' ) );
                if ( match ) ex.to.be.ok; else ex.to.not.be.ok;
            });
        };

        shouldBe( 1, '/buy/breakfast' );
        shouldBe( 1, '/buy/breakfast/menu' );
        shouldBe( 0, '/buy/breakfast/snacks' );
        shouldBe( 0, '/buy/breakfast/snacks/chicken' );
        shouldBe( 1, '/buy/breakfast/snacks/chicken/wings' );
        shouldBe( 1, '/buy/breakfast/snacks/fromage' );
        shouldBe( 0, '/buy/breakfast/free' );
        shouldBe( 0, '/buy/breakfast/something' );

    });

});
