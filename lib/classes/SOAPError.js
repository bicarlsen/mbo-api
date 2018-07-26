function SOAPError( code, message ) {
	this.code 		= code;
    this.message 	= message;
    this.name 		= "SOAPError";
    Error.captureStackTrace( this, SOAPError );
}
SOAPError.prototype = Object.create( Error.prototype );
SOAPError.prototype.constructor = SOAPError;

module.exports = SOAPError;