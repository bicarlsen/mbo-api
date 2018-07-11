/**
 * @author  Brian Carlsen
 * @version  1.0.0
 *
 * A logger for tracking calls to the MINDBODY API
 *
 * Emits a 'ready' event on the service after initialization.
 */

module.exports.setHost = function( host, port = 80 ) {
	this._host = host;
	this._port = port;
};

module.exports.setPath = function( path ) {
	this._path = path;
}

module.exports.

// TODO
module.exports.log = function() {
	// Logs requests for tracking
	var loggerParams = {
		host: 	this._host,
		port: 	this._port,
		path: 	this._path,
		method: 'post',
		headers: {
			'Content-Type': 	'application/json',
			'Content-Length': 	undefined
		}
	};

	var loggerData = {
		params: params,
		method: name,
		error: 	undefined
	};

	if ( result[ name + 'Result' ].ErrorCode !== 200 ) { // SOAP Fault occured
		loggerData.error = {
			status: 	result[ name + 'Result' ].Status,
			errorCode: 	result[ name + 'Result' ].ErrorCode,
			message: 	result[ name + 'Result' ].Message
		};
	}

	loggerData = JSON.stringify( loggerData ); 
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