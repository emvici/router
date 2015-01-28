var Util = require( 'findhit-util' ),
    Error = require( './error' ),

    debug = require( 'debug' )( 'emvici-router:path' );

// -----------------------------------------------------------------------------

function Path ( pattern, options ) {

    if( Util.is.Object( pattern ) ) {
        options = pattern;
        pattern = options.pattern;
    }

    // Check if pattern is either a String, Array or Regexp
    // If not, throw an error
    if( Util.isnt.String( pattern ) && Util.isnt.Array( pattern ) && Util.isnt.RegExp( pattern ) ) {
        throw new TypeError( "pattern isn't a valid option" );
    }

    this.keys = [];
    this.options = Util.is.Object( options ) && options || {};
    this.options.__proto__ = Path.defaultOptions;

    this.pattern = pattern;
    this.regexp = this.Pattern2RegExp();

    return this;

};

Path.defaultOptions = {
    sensitive: false,
    strict: false,
};

// Export Path
module.exports = Path;

/* instance methods */

Path.prototype.PatternAndParams2Url = function ( pattern, params ) {
    var url = pattern || this.pattern,
		keys = this.keys,
		_keys = [],
		i;

	// First replace the variables from path
	for( var i in keys ){
		_keys.push( keys[i].name );

		if( params[ keys[i].name ] )
			// Replace on url
			url = url.replace( new RegExp( '/:'+keys[i].name+'(\\([a-z|\/]*\\))?(\\?)?', 'i' ), '/'+ params[ keys[i].name ] );
		else if( keys[i].required )
			throw new Error("A required param on path isn't here...");
	}

	if ( params ){
		var parts = [];

		for( var i in params ){

			// verify if it is a key
			if( _keys.indexOf( i ) > -1 )
				continue;

			parts.push( i +':'+ ( ( typeof params[i] == 'string' ) && params[i] || JSON.stringify( params[i] ) ) );
		}

		// Check if route has an multi argument acceptance
		url = url.match(/\/\*.*/i) && url.replace( /\/\*.*/i, '' ) || url;

		// Now apply the rest of params if we have the /** at the end of the url
		if( parts.length )
			url = url.replace( /\/$/i, '' ) +'/'+ parts.join('/');
	}

	return url;
};

Path.prototype.Pattern2RegExp = function ( pattern ) {
    pattern = pattern || this.pattern;

    var keys = this.keys,

        options = this.options,
        sensitive = !! options.sensitive,
        strict = !! options.strict;

    // If url is already a RegExp, return it
    if ( Util.is.RegExp( pattern ) ) {
        return pattern;
    }

    // If url provided was an Array, we should concat it between parents
    if ( Util.is.Array( pattern ) ) {
        pattern = '(' + pattern.join( '|' ) + ')';
    }

    var regexp = this.regexp = new RegExp( ''
        + '^'
        + pattern
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

    return regexp;
};

Path.prototype.match = function ( url ) {
    return this.regexp.exec( url );
};

Path.prototype.Url2Params = function ( url ) {
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
