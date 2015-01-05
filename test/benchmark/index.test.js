var Promise = require( 'bluebird' ),
    Util = require( 'findhit-util' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

//------------------------------------------------------------------------------

// Use: `DISCARD=benchmark,... npm test` to bypass benchmarks

if( ( process.env.DISCARD || '' ).indexOf( 'benchmark' ) > -1 ) {
    return;
}

var targets = {
        emvici: require( './emvici-router' ),
        express: require( './express' ),
    };

var testreport = function ( target, ctx ) {
        var print = [ "" , "Report for: "+ target ];

        Util.Object.each( ctx, function ( ms, reqs ) {
            print.push( reqs + ' reqs:     ' + ms + ' ms' );
        });

        print.push( "" );
        console.log(print.join("\n"));
    };
    testReqs = function ( target, requests ) {
        var self = this;

        it( requests +' reqs', function () {
            return Promise.all([
                targets[ target ]( requests ),
                targets[ target ]( requests ),
                targets[ target ]( requests )
            ])
                .then(function ( times ) {
                    self[ requests ] = times.reduce(function ( a, b ) { return a + b; }) / 3;
                })
                .delay( 200 );
        });
    },
    testPlatform = function ( target, mainCtx ) {
        describe( target, function () {
            var ctx = mainCtx[ target ] = {};

            testReqs.call( ctx, target, 150 );
            testReqs.call( ctx, target, 250 );

        });
    };

describe( "Benchmark", function () {
    var ctx = {};

    testPlatform( 'emvici', ctx );
    testPlatform( 'express', ctx );

    after(function () {
        for( var target in ctx ) {
            testreport( target, ctx[ target ] );
        }
    });
});
