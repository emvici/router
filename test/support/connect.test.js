var Util = require( 'findhit-util' ),

    connect = require( 'connect' ),
    constructor = require( '../../index' ),

    request = require( 'supertest' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;


describe( "connect", function () {
    var app, router;

    beforeEach(function () {
        app = connect();
        router = constructor();

        app.use( router );
    });

    describe( "routes", function () {

        it( "basic get route", function ( done ) {

            router.route({
                url: [ '/' ],
                stack: function ( req, res, next ) {
                    res.status( 200 ).send( "OK" ).end();
                },
            });

            request( app )
                .get( '/' )
                .expect( 200, '/', done );

        });

    });

});
