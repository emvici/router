var Promise = require( 'bluebird' ),
    connect = require( 'connect' ),
    constructor = require( '../../index' ),

    request = require( 'supertest' ),
    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

module.exports = function ( requests, timeout ) {
    var self = {};

    var app = connect(),
        router = constructor();

    app.use(function ( req, res, next ) { req.session = {}; next(); });
    app.use( router );

    router.addRoute({
        url: [ '/' ],
        stack: [
            function ( req, res, next ) {
                res.statusCode = 200;
                res.write( 'TEST' );
                res.end();
            }
        ],
    });

    return new Promise(function ( fulfill, reject ) {
        self.start = new Date(),
        self.total = 0;

        for( var i = 0; i < requests; i++ ) {
            request( app ).get( '/' ).expect( 200, 'TEST', function ( err ) {

                if( err ) {
                    reject( err );
                    return;
                }

                self.total++;

                if( self.total === requests ){
                    fulfill();
                }
            });
        }

        setTimeout( reject, timeout || 8000 );
    })
        .then(function () {
            return new Date() - self.start;
        });
};
