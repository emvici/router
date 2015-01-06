var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Router = require( '../../lib/router' ),
    Route = require( '../../lib/route' ),

    connect = require( 'connect' ),
    request = require( 'supertest' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( "params", function () {

    var router, app;

    beforeEach(function () {
        router = new Router();
        app = connect();

        app.use( router );

        app.use(function ( err, req, res, next ) {
            res.statusCode = err.code || 500;
            res.write( err.message || 'Internal Error' );
            res.end();
        });
    });


    beforeEach(function () {

        router.addRoute({
            url: [
                // Expect no param
                '/api/users',

                // Expect number between 0-99999
                '/api/users/:id([0-9]{1,5})',

                // Expect word with maximum of 20 chars
                '/api/users/:name([a-z]{1,20})'
            ],
            stack: function ( req, res ) {

                res.write(
                    req.params.id && 'id:'+req.params.id ||
                    req.params.name && 'name:'+req.params.name ||
                    JSON.stringify( req.params )
                );

                res.end();

            }
        });

    });

    it( "should not populate req.params if no param is matched", function ( done ) {

        request( app )
            .get( '/api/users' )
            .expect( 200, '{}', done );

    });

    it( "should not populate req.params.id if id param is matched", function ( done ) {

        request( app )
            .get( '/api/users/4' )
            .expect( 200, 'id:4', done );

    });

    it( "should not populate req.params.name if name param is matched", function ( done ) {

        request( app )
            .get( '/api/users/cuss' )
            .expect( 200, 'name:cuss', done );

    });

    it( "should run provided stack to router.param", function ( done ) {
        var id;

        router.param( 'id', function ( req, res, next ) {
            id = parseInt( req.params.id );
            next();
        });

        request( app )
            .get( '/api/users/4' )
            .expect( 200, 'id:4', function ( err ) {
                if( err ) return done( err );

                try{

                    expect( id ).to.be.equal( 4 );

                } catch ( err ) {
                    done( err );
                    return;
                }

                done();
            });

    });

    it( "should run provided stack from router.param method", function ( done ) {
        var name;

        router.param( 'name', function ( req, res, next ) {
            name = req.params.name;
            next();
        });

        request( app )
            .get( '/api/users/cuss' )
            .expect( 200, 'name:cuss', function ( err ) {
                if( err ) return done( err );

                try{

                    expect( name ).to.be.equal( 'cuss' );

                } catch ( err ) {
                    done( err );
                    return;
                }

                done();
            });

    });

    it( "should NOT run route if param throws an error", function ( done ) {
        var id;

        router.param( 'id', function ( req, res, next ) {
            throw new Error( "fake modafoka" );
        });

        request( app )
            .get( '/api/users/4' )
            .expect( 500, 'fake modafoka', done );

    });

});
