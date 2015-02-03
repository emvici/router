var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest-as-promised' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' );

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router, route, agent;

    describe( "router.addRoute", function () {

        describe.only( "type: wizard", function () {

            before(function () {
                var _ = helper();
/*{
    reqSessionKey : 'wizzard_session'
}*/

                app = _.app;
                router = _.router;

                agent = request(app);

                route = router.addRoute({
                    url: '/auth/register',
                    type: 'wizard',
                    autoReset: true,
                    steps: [
                        {
                            type: 'step',
                            title: 'Terms and Conditions',
                            name: 'tos',

                            prepare: function ( req, res, next ) {
                                res.response += 'tos';

                                next();
                            },

                            process: function ( req, res, next ) {
                                next();
                            }
                        },
                        {
                            type: 'step',
                            title: "Who are you?",
                            name : "who-are-you",

                            prepare: function ( req, res, next ) {
                                res.response += 'who-are-you';

                                next();
                            },

                            process: function ( req, res, next ) {
                                var p = req.body.process = {
                                    first_name: 'Casa',
                                    last_name: 'Nova',
                                    gender: 'F',
                                    birthday: '27/05/1986',
                                };

                                return !! ( r.first_name && r.last_name && r.gender && r.birthday );
                            }
                        },
                        {
                            type: 'step',
                            title: "Internationalization",
                            name : "i18n",

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
                            }
                        },
                        {
                            type: 'step',
                            title: "Credentials",
                            name : "credentials",

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
                            }
                        },
                        {
                            type: 'step',
                            title: "Congrats!!!",
                            name : "congrats",

                            prepare: function () {
                                req.data.identity = req.body.identity;
                                req.data.cred = req.body.cred;

                                return true;
                            },

                            process: function ( req, res, next ) {
                                var c = req.body.congratulations = { finish: 1 };

                                return !! c.finish;
                            }
                        }

                    ]
                });
            });

            /*it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function(){
                return agent
                    .get( '/auth/register' )
                    .expect(200)
                    .expect( 200, JSON.stringify({
                        url: '/auth/register',
                        response: 'tos'
                    }));
            });

            it("should redirect to the first step /tos", function(){
                return agent
                    .get( '/auth/register/tos' )
                    .expect(200)
                    .expect( 200, JSON.stringify({
                        url: '/auth/register/tos',
                        response: 'tos'
                    }));
            });

            it( "should be able to access tos step", function () {
                return agent
                    .get( '/auth/register/tos' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/tos',
                            response: 'tos'
                        })
                    );
            });

            it( "shouldn't be able to access who-are-you step", function () {
                return agent
                    .get( '/auth/register/who-are-you' )
                    .expect(302)
                    .then(function(res){
                        expect(res.headers.location).to.be.equal('/auth/register/tos');
                    });

            });*/

            it( "until you process tos step", function () {

                return agent
                    .post( '/auth/register/tos' )
                    .expect( 302 )
                    .then( function( res ) {
                        expect(res.headers.location).to.be.equal('/auth/register/who-are-you');
                    });

            });

            it( "should be able to access who-are-you step", function () {

                return agent
                    .get( '/auth/register/who-are-you' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/who-are-you',
                            response: 'who-are-you'
                        })
                    );

            });

            it( "should redirect if a non-empty step was hited" );

            it( "should access first step" );

            it( "should access second step if first one was hited!");

        });

    });

});
