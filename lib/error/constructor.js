module.exports = function ( name, defaultCode, defaultMessage ) {
    var NewError = function ( message, code ) {
        this.message = message;
        this.code = code;

        return this;
    };

    NewError.prototype = Object.create( Error.prototype );

    NewError.prototype.name = name;
    NewError.prototype.code = defaultCode;
    NewError.prototype.message = defaultMessage;

    return NewError;
};
