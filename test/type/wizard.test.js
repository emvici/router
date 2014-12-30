var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Route = require( '../../lib/route' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( "Route -> Wizard", function () {
    var route;

    before(function () {
        route = Route.construct({
            url: '/wizard/breakfast',
            type: 'wizard',
            steps: {
                want: { // step
                    stack: sinon.spy(),
                },
                second: { // step
                    stack: sinon.spy(),
                },
                conditional: { // branch

                    anotherconditional: { // branch

                        third: { // step
                            stack: sinon.spy(),
                        },

                    },

                    fourth: { // step
                        stack: sinon.spy(),
                    },
                },
                fifth: { // step
                    stack: sinon.spy(),
                }
            },
        });
    });

    it( "should have 5 steps", function () {
        expect( route.steps ).to.have.length( 5 );
    });

    it( "should have 2 branches", function () {
        expect( route.branches ).to.have.length( 2 );
    });

    describe( "match", function () {

        it( "should match /wizard/breakfast", function () {
            expect( route.match( '/wizard/breakfast', 'GET' ) ).to.be.ok;
        });

        it( "should match /wizard/breakfast/want", function () {
            expect( route.match( '/wizard/breakfast/want', 'GET' ) ).to.be.ok;
        });

        it( "should NOT match /wizard/breakfast/want", function () {
            expect( route.match( '/wizard/breakfast/wanta', 'GET' ) ).to.not.be.ok;
        });

    });

});
