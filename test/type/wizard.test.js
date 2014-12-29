var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    Route = require( '../lib/route' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

var stackFn = function ( req, res, next ) {
    res.write( req.step.name );
    next();
};

describe( "Route type - Wizard", function () {
    var route;

    before(function () {
        route = Route.construct({
            steps: {
                first: {
                    stack: stackFn,
                },
                second: {
                    stack: stackFn,
                },
                conditional: {
                    third: {
                        stack: stackFn,
                    },
                    fourth: {
                        stack: stackFn,
                    },
                }
                fifth: {
                    stack: stackFn,
                }
            },
        });
    });

    it( "Dispatch a first request and check if first step was received", function () {



    });

});
