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

                    steps: [

                        {
                            name: "tos",
                            title: "Terms and Conditions",

                            prepare: function ( req, res, next ) {
                                return true;
                            },

                            process: function ( req, res, next ) {
                                req.body.tos = { accept: 1 };

                                return !! req.body.tos.accept;
                            },

                        },

                        {
                            name: 'identity',
                            title: "Who are you?",

                            prepare: function ( req, res, next ) {
                                return true;
                            },

                            process: function ( req, res, next ) {
                                var p = req.body.process = {
                                        first_name: 'Casa',
                                        last_name: 'Nova',
                                        gender: 'F',
                                        birthday: '27/05/1986',
                                    };

                                return !! ( r.first_name && r.last_name && r.gender && r.birthday );
                            },

                        },

                        {
                            name: 'internationalization',
                            title: "Internationalization",

                            prepare: function ( req, res, next ) {
                                var i = req.body.internationalization = {
                                        language_id: {
                                            43: 'Portuguese',
                                            8: 'English',
                                            12: 'Russian',
                                        }
                                    };

                                req.data.language_id = i.language_id;
                                return true;
                            },

                            process: function ( req, res, next ) {
                                var i = req.body.internationalization = { language_id: 8 };

                                return !! parseInt( i.language_id );
                            },
                        },

                        {
                            name: 'credentials',
                            title: "Credentials",

                            prepare: function () {
                                return true;
                            },

                            process: function ( req, res, next ) {
                                var c = req.body.credentials = {
                                        password: 'youshallnotpass',
                                        security_answer: 'what is your pet name?',
                                        security_question: 'i like bacon!',
                                    };

                                return !! ( c.password && c.security_answer && c.security_question );
                            },

                        },

                        {
                            name: 'congratulations',
                            title: "Congrats!!!",

                            prepare: function () {
                                req.data.identity = req.body.identity;
                                req.data.cred = req.body.cred;

                                return true;
                            },

                            process: function ( req, res, next ) {
                                var c = req.body.congratulations = { finish: 1 };

                                return !! c.finish;
                            },
                        },

                    ],
                });

            });

            it( "shouldn't save route on session")


            it( "should redirect if a non-empty step was hited" );

            it( "should access first step" );

            it( "should access second step if first one was hited!");

        });

    });

});
