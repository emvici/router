module.exports = function ( name, defaultCode, defaultMessage ) {
    var NewError = function ( message, code ) {

        if( message ) this.message = message;
        if( code ) this.code = code;

        Error.captureStackTrace( this, NewError );

        return this;
    };

    NewError.prototype = Object.create( Error.prototype );

    NewError.prototype.name = name;
    NewError.prototype.code = defaultCode;
    NewError.prototype.message = defaultMessage;

    return NewError;
};
