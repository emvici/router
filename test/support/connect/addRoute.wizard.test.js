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

        describe( "type: wizard", function () {

            before(function () {
                router.addRoute({
                    url: '/register',
                    type: 'wizard',
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
