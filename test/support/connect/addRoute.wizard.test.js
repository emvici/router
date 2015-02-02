var Util = require( 'findhit-util' ),

    Route = require( '../../../lib/route' ),

    request = require( 'supertest' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect,

    helper = require( './_' ),
    testRoute = require('./test.route.wizard');

// -----------------------------------------------------------------------------

describe( "support connect", function () {
    var app, router;

    describe( "router.addRoute", function () {

        describe( "type: wizard", function () {

            before(function () {
                var _ = helper();

                app = _.app;
                router = _.router;
//console.log(testRoute);
                var ConstructedRoute = router.addRoute(testRoute);
//console.log(ConstructedRoute);
            });

            it( "shouldn't save route on session",function(){
//console.log('uelee',app);
                var r = request(app);

                r.get('/register',function(req,res){
console.log('eheree');
                });
//console.log(r);
            });

            it( "should redirect if a non-empty step was hited" );

            it( "should access first step" );

            it( "should access second step if first one was hited!");

        });

    });

});
