var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' );

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router;

    describe( "router.addRoute", function () {

        describe( "type: wizard", function () {

            before(function () {
                var _ = helper();

                app = _.app;
                router = _.router;

                router.addRoute({
                    url: '/register',
                    type: 'wizard',
                    steps: {

                        tos: {
                            title: "Terms and Conditions",

                            prepare: function () {

                            },
                        },

                        identity: {
                            title: "Who are you?",

                            prepare: function () {

                            },
                        },

                        internationalization: {
                            title: "Internationalization",

                            prepare: function () {

                            },
                        },

                        credentials: {
                            title: "Credentials",

                            prepare: function () {

                            },
                        },

                        congratulations: {
                            title: "Congrats!!!1",

                            prepare: function () {

                            },
                        },

                    },
                });

            });

            it( "should redirect if a non-empty step was hited", function () {

            });

            it( "should access first step", function () {

            });

            it( "should access second step if first one was hited!", function () {

            });

        });

    });

});
