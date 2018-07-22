/**
 * @author  Brian Carlsen
 * @version  1.0.0
 *
 * A logger for tracking calls to the MINDBODY API
 */

var fs 		= require( 'fs' ),
	http 	= require( 'http' );


/**
 * Used to log requests to the MINDBODY server.
 *
 * @param {string} type The type of logger to be used. 
 *		Either 'local' to log to a local file, or
 * 		'remote' to log to a remote server. 
 * @param {string} service Sets the service associated with the logger.
 *
 * @throws {Error} Throws error if an invalid type parameter is passed.
 */
 function mbo_Logger( type, service ) {
 	if ( [ 'local', 'remote' ].indexOf( type ) === -1 ) {
 		// invalid type
 		throw new Error( 'Invalid type for mbo_Logger. Must be "local" or "remote".' );
 	}
 	
 	this.type 		= type;
 	this.service 	= service;
 	this.host 		= undefined;
 	this.port 		= 80;
 	this.path 		= undefined;
 }

 /**
  * Sets the name of the service.
  *
  * @param {string} service The service associated with the logger.
  */
 mbo_Logger.prototype.setService = function( service ) {
 	this.service = service;
 };

/**
 * Sets the host and port of the logger. Can only be used for remote loggers."
 *
 * @param {string} host The host for the Logger to post data to.
 * @param {int} port The port to acces the host by.
 *
 * @throws {Error} If Logger type is not remote.
 */ 
mbo_Logger.prototype.setHost = function( host, port = 80 ) {
	if ( this.type !== 'remote' ) {
		throw new Error( 'mbo_Logger must be of type remote to set host.' );
	}

	this.host = host;
	this.port = port;
};

/**
 * Sets the path to send the log to.
 * If a local Logger, path should point to a file to append to.
 * If a remote Logger, the path of the host to post the data to.
 *
 * @param {string} path The path for the Logger to post to.
 */
mbo_Logger.prototype.setPath = function( path ) {
	this.path = path;
};

/**
 * Creates data string to be logged.
 *
 * @param {object} params The parameters submitted during the call.
 * @param {string} method The method called.
 * @param {object} result The result of the call.
 *
 * @return {string} Returns the JSON stringified version of the request.
 */
mbo_Logger.prototype._createLoggerData = function( params, method, result ) {
	var loggerData = {
		service: 	this.service,
		params: 	params,
		method: 	method,
		error: 		undefined
	};

	var res = result[ method + 'Result' ];
	if ( res.ErrorCode !== 200 ) { // SOAP Fault occurred
		loggerData.error = {
			status: 	res.Status,
			errorCode: 	res.ErrorCode,
			message: 	res.Message
		};
	}

	return JSON.stringify( loggerData ); 
};

/**
 * Internal function used for local logging.
 * Writes log data to a local file.
 * path defaults to ./mbo-api.log
 *
 * @param {object} params The request parameters submitted to the MINDBODY API.
 * @param {string} method The name of the method called on the MINDBODY API.
 * @param {object} result The result from the function call.
 */
mbo_Logger.prototype._logLocal = function( params, method, result ) {
	var data = this._createLoggerData( params, method, result );
	data = '[' + ( new Date() ).toISOString() + '] ' + data + '\n';

	var path = this.path || './mbo-api.log';
	fs.appendFile( path, data, function( err ) {
		if ( err ) {
			throw err;
		}
	} );
};

/**
 * Internal function used for remote logging.
 * Posts data to the set host, port, and path.
 * host defaults to localhost, port defaults to 80, and path defaults to /.
 *
 * @param {object} params The request parameters submitted to the MINDBODY API.
 * @param {string} method The name of the method called on the MINDBODY API.
 * @param {object} result The result from the function call.
 */
mbo_Logger.prototype._logRemote = function( params, method, result ) {
	// check host and path are set

	var loggerParams = {
		host: 	this.host || 'localhost',
		port: 	this.port || 80,
		path: 	this.path || '/',
		method: 'post',
		headers: {
			'Content-Type': 	'application/json',
			'Content-Length': 	undefined
		}
	};

	var loggerData = this._createLoggerData( params, method, result)
	loggerParams.headers['Content-Length'] = loggerData.length;

	var loggerReq = http.request( loggerParams, function( res ) {
		var data = '';
		res.setEncoding( 'utf8' );

		res.on( 'data', function( chunk ) {
			data += chunk;
		} );

		res.on( 'end', function() {
			if ( res.statusCode !== 200 ) {
				console.log( "[MBO Logger Error]", data, loggerData.error );
			}
		} );
	} )
	.on( 'error', function( err ) {
		console.log( "[MBO Logger]", err );
	} );

	loggerReq.write( loggerData );
	loggerReq.end();
};

mbo_Logger.prototype.log = function( params, method, result ) {
	switch ( this.type ) {
		case 'local':
			this._logLocal( params, method, result );
			break;
		case 'remote':
			this._logRemote( params, method, result );
			break;
		default:
			throw new Error( 'Invalid type property' );
			break;
	};
};

module.exports = mbo_Logger;