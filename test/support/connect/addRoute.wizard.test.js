var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest-as-promised' ),
    Session = require( 'supertest-session' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' ),
    testRoutes = require( './routes.test.js' ),
    debug = require( 'debug' )('emvici-router:route:type:wizard:tests');

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router, route, agent, session, S;

    describe( "router.addRoute", function () {

        before(function(){
            var _ = helper();

            app = _.app;
            router = _.router;

            agent = request(app);

            S = Session({
                app: _.app,
                envs: { NODE_ENV: 'development' }
            });
        });

        describe( "type: wizard: strictNavigation:true", function () {

            before(function () {
                session = new S();

                route = router.addRoute(testRoutes);
            });

            after(function(){
                session.destroy();
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function( done ){
                session
                    .get( '/auth/register/' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end( done );

            });

            it( "should be able to access /tos step", function ( done ) {
                session
                    .get( '/auth/register/tos' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end( done );

            });

            it( "shouldn't be able to access who-are-you step", function ( done ) {
                session
                    .post( '/auth/register/who-are-you' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end( done );

            });

            it( "until you process tos step", function ( done ) {

                session
                    .post( '/auth/register/tos' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/who-are-you' )
                    .end( done );

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
                    .end( done );

            });

            it( "but not letting you to go back", function ( done ) {

                session
                    .get( '/auth/register/tos' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/who-are-you' )
                    .end( done );

            });

        });

        describe( "type: wizard: strictNavigation:false", function () {

            before(function () {
                session = new S();
                router.Routes = [];

                testRoutes.strictNavigation = false;
                route = router.addRoute(testRoutes);
            });

            after(function(){
                session.destroy();
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function ( done ){
                session
                    .get( '/auth/register/' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end( done );
            });

            it( "should be able to access /tos step", function ( done ) {
                session
                    .get( '/auth/register/tos' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end( done );

            });

            it( "should be able to access /who-are-you step", function ( done ) {
                session
                    .get( '/auth/register/who-are-you' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/who-are-you' )
                    .end( done );
            });

            it( "should be able to access /i18n step", function ( done ) {
                session
                    .get( '/auth/register/i18n' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/i18n' )
                    .end( done );
            });

            it( "should be able to access /credentials step", function ( done ) {
                session
                    .get( '/auth/register/credentials' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/credentials' )
                    .end( done );
            });

            it( "should be able to access /congrats step", function ( done ) {
                session
                    .get( '/auth/register/congrats' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/congrats' )
                    .end( done );
            });

        });

        describe( "type: wizard: strictNavigation:function accessOddSteps", function () {

            before(function () {
                var accessOddSteps = function( requestedStep, currentStep, route ){
                        return false;
                    };

                session = new S();

                router.Routes = [];
                testRoutes.strictNavigation = accessOddSteps;
                route = router.addRoute(testRoutes);
            });

            after(function(){
                session.destroy();
            });

            it( "should have 5 steps", function () {
                expect( route.steps ).to.have.length( 5 );
            });

            it("should redirect to the first step /", function( done ){
                session
                    .get( '/auth/register/' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/' )
                    .end(done);
            });

            it("should be able to access first step /tos", function( done ){
                session
                    .get( '/auth/register/tos' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            });

            it( "shouldn't be able to access the second step /who-are-you", function ( done ) {
                session
                    .get( '/auth/register/who-are-you' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            });

            it( "should be able to access the third step /i18n", function ( done ) {
                session
                    .get( '/auth/register/i18n' )
                    .expect( 200 )
                    .expect( 'Location', '/auth/register/i18n' )
                    .end(done);
            });

            it( "shouldn't be able to access the fourth step /credentials", function ( done ) {
                session
                    .get( '/auth/register/credentials' )
                    .expect( 302 )
                    .expect( 'Location', '/auth/register/tos' )
                    .end(done);
            });

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
