var Util = require( 'findhit-util' ),
    Error = require( './error' ),

    debug = require( 'debug' )( 'emvici-router:path' );

// -----------------------------------------------------------------------------

function Path ( url, options ) {

    if( Util.is.Object( url ) ) {
        options = url;
        url = options.url;
    }

    // Check if url is either a String, Array or Regexp
    // If not, throw an error
    if( Util.isnt.String( url ) && Util.isnt.Array( url ) && Util.isnt.RegExp( url ) ) {
        throw new TypeError( "url isn't a valid option" );
    }

    this.url = url;
    this.keys = [];
    this.options = Util.is.Object( options ) && options || {};
    this.options.__proto__ = Path.defaultOptions;

    this.regexp = parseRegExp.call( this );

    return this;

};

Path.defaultOptions = {
    sensitive: false,
    strict: false,
};

// Export Path
module.exports = Path;

/* instance methods */

Path.prototype.match = function ( url ) {
    return this.regexp.exec( url );
};

Path.prototype.params = function ( url ) {
    var params = {},
        keys = this.keys,
        m = this.regexp.exec( url ),
        i, len = m.length;

    for ( i = 1; i < len; ++i ) {
        var key = keys[i - 1];

        try {
            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
        } catch ( parentErr ) {
            var err = new Error.InternalError( "Failed to decode param" );

            err.param = i;
            err.value = m[i];
            err.key = i;

            err.parent = parentErr;

            throw err;
        }

        if ( key ) {
            params[ key.name ] = val;
        } else {
            params[ n++ ] = val;
        }
    }

    return params;
};

/* private methods */

var parseRegExp = function () {

    var url = this.url,
        keys = this.keys,

        options = this.options,
        sensitive = !! options.sensitive,
        strict = !! options.strict;

    // If url is already a RegExp, return it
    if ( Util.is.RegExp( url ) ) {
        return url;
    }

    // If url provided was an Array, we should concat it between parents
    if ( Util.is.Array( url ) ) {
        url = '(' + url.join( '|' ) + ')';
    }

    return new RegExp( ''
        + '^'
        + url
            .concat( strict ? '' : '/?' )
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function( _, slash, format, key, capture, optional, star ){
                keys.push({ name: key, optional: !! optional });
                slash = slash || '';
                return ''
                    + ( optional ? '' : slash )
                    + '(?:'
                    + ( optional ? slash : '' )
                    + ( format || '') + ( capture || ( format && '([^/.]+?)' || '([^/]+?)' ) ) + ')'
                    + ( optional || '' )
                    + ( star ? '(/*)?' : '' );
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)')
        + '$',

        // Should it be case-sensitive?
        sensitive ? '' : 'i'

    );
};
