var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest-as-promised' ),
    Session = require( 'supertest-session' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' ),
    testRoutes = require( './routes.test.js' );

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router, route, agent, session;

    describe( "router.addRoute", function () {

        describe( "type: wizard: strictNavigation:true", function () {

            before(function () {
                var _ = helper();

                app = _.app;
                router = _.router;

                agent = request(app);

                var s = Session({
                    app: _.app,
                    envs: { NODE_ENV: 'development' }
                });
                session = new s();

                route = router.addRoute(testRoutes);
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function(){
                return agent
                    .get( '/auth/register' )
                    .expect( 200, JSON.stringify({
                        url: '/auth/register',
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

            });

            it( "until you process tos step", function ( done ) {

                session
                    .post( '/auth/register/tos' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/who-are-you' )
                    .end(done);

            });

            it( "and now it should be able to access who-are-you step", function ( done ) {

                session
                    .get( '/auth/register/who-are-you' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/who-are-you',
                            response: 'who-are-you'
                        })
                    )
                    .end(done);

            });

            it( "but not letting you to go back", function ( done ) {

                session
                    .get( '/auth/register/tos' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/who-are-you' )
                    .end(done);

            });

        });


        describe( "type: wizard: strictNavigation:false", function () {

            before(function () {
                var _ = helper();

                app = _.app;
                router = _.router;

                agent = request(app);

                testRoutes.strictNavigation = false;
                route = router.addRoute(testRoutes);
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function(){
                return agent
                    .get( '/auth/register' )
                    .expect( 200, JSON.stringify({
                        url: '/auth/register',
                        response: 'tos'
                    }));
            });

            it( "should be able to access /tos step", function () {
                return agent
                    .get( '/auth/register/tos' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/tos',
                            response: 'tos'
                        })
                    );
            });

            it( "should be able to access /who-are-you step", function () {
                return agent
                    .get( '/auth/register/who-are-you' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/who-are-you',
                            response: 'who-are-you'
                        })
                    );

            });

            it( "should be able to access /i18n step", function () {
                return agent
                    .get( '/auth/register/i18n' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/i18n',
                            response: 'i18n'
                        })
                    );

            });

            it( "should be able to access /credentials step", function () {
                return agent
                    .get( '/auth/register/credentials' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/credentials',
                            response: 'credentials'
                        })
                    );

            });

            it( "should be able to access /congrats step", function () {
                return agent
                    .get( '/auth/register/congrats' )
                    .expect( 200,
                        JSON.stringify({
                            url: '/auth/register/congrats',
                            response: 'congrats'
                        })
                    );

            });

        });

        describe( "type: wizard: strictNavigation:function accessOddSteps", function () {

            before(function () {
                var _ = helper(),
                    accessOddSteps = function( requestedStep, currentStep, route ){
                        console.log('navigate-----------------------------------------------------------------------------------------',currentStep.name,requestedStep.name);
                        return false;
                    };

                app = _.app;
                router = _.router;

                agent = request(app);

                var s = Session({
                    app: _.app,
                    envs: { NODE_ENV: 'development' }
                });
                session = new s();

                testRoutes.strictNavigation = accessOddSteps;
                route = router.addRoute(testRoutes);


console.log('------------------------------------------------------------------------------------------------------------------------');
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            /*it("should redirect to the first step /", function( done ){
                session
                    .get( '/auth/register/' )
                    .then(function(res){
console.log('res',res);
                    });
                    /*.expect( 200 )
                    .expect( 'Location', '/auth/register/' )
                    .end(done);* /
            });*/

            it("should be able to access first step /tos", function( done ){
                session
                    .get( '/auth/register/tos' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            });

            /*it( "shouldn't be able to access the second step /who-are-you", function ( done ) {
                session
                    .get( '/auth/register/who-are-you' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            });*/

            it( "should be able to access the third step /i18n", function ( done ) {
                session
                    .get( '/auth/register/i18n' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/i18n' )
                    .end(done);
            });

            /* it( "shouldn't be able to access the fourth step /credentials", function ( done ) {
                session
                    .get( '/auth/register/credentials' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            }); */

            it( "should be able to access the fifth step /congrats", function ( done ) {
                session
                    .get( '/auth/register/congrats' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/congrats' )
                    .end(done);
            });

        });

    });

});
