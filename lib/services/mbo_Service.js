/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a base class for interacting with the actual 
 * MINDBODY services: Client, Class, Sale, Staff, and Site.
 */

var	EventEmitter 		= require( 'events' ).EventEmitter,
	soap 				= require( 'soap' ),
	Promise 			= require( 'bluebird' ),
	OperationalError 	= Promise.OperationalError;

var Credentials = require( '../classes/mbo_Credentials' ),
	SOAPError 	= require( '../classes/SOAPError' ),
	mboLogger 	= require( '../../logger/mbo_Logger' );

//******************************//

/**
 * This class is not meant to be instantiated, and only serves as a base class for the actual Service classes.
 * 
 * Creates a new MBO Service.
 * Retrieves the WSDL of the given service and creates two methods for each SOAP method in the WSDL.
 * For each SOAP method a function is created:
 * 1) Bearing the same name that either extracts the result of the same name, and
 * 2) Bearing the name with 'Response' post-fixed, which returns an array of the
 * 		i) 		Raw response converted to a JS object
 * 		ii) 	Raw XML response
 * 		iii) 	Raw XML SOAP header info
 * Each of these functions returns an A+ Promise.
 *
 * Each method of the service methods accepts an Object as a parameter as well.
 * Each element of the object will be included in the Request section of the SOAP Request.
 *
 * Emits an 'initialized' event once all methods have been defined.
 * A 'ready' event is triggered by the ServiceFactory once User Credentails have been set.
 *
 * @constructor
 * @param  {string|boolean} service 	The full name of the service to be implemented. E.g 'SaleService'
 		Set to False if no service is desired.
 * @param  {object|Credentials} credentials     
 									An object containing your MINDBODY developer credentials, included in all service calls.
 *									If has the keys [ 'sourcename', 'password' ] will use SourceCredentials.
 									If has the keys [ 'apiKey' ] will use the API-key header.			
 * @param  {int[]} [siteIds] 	   	An array containg site Ids to add.
 * @param  {number} apiVersion 		The MINDBODY API version you wish to use. 
 * 									Defaults to the most recent stable release.
 *
 * @return {mbo_Service} An absract service to interact with the MINDBODY API service.
 *
 * @throws {Error} Throws an error if invalid credentials object is passed.
 */	
function mbo_Service( service, credentials, siteIds, apiVersion = 5.1 ) {
	var self = this;
	self.name = service;
	self.mboLogger = undefined;
	self.emitter = new EventEmitter();
	
	self.ready = false;
	self.on( 'ready', function() { self.ready = true; } );

	if ( credentials instanceof Credentials ) {
		// credentials already Credentials
		self.sourceCredentials = credentials;
	}
	else {
		self.sourceCredentials = new Credentials( credentials, siteIds, 'source' );
	}
	
	self.userCredentials = undefined;
	self._useDefaultUserCredentials = false;

	// Request Defaults
	self.requestDefaults = {
		XMLDetail: 'Full',
		PageSize: '1000' 
	};

	self.apiVersion = apiVersion;
	self.apiVersionString = ( function( version ) {
		switch( version ) {
			case 5.0: return '0_5'; 	break;
			case 5.1: return '0_5_1'; 	break;
			case 6.0: return '0_6'; 	break;
		};
	} )( apiVersion )

	if ( service === false ) {
		self.emit( 'initialized' );
		return self;
	}

	// Setup SOAP Client 
	soap.createClientAsync( 'https://api.mindbodyonline.com/' + self.apiVersionString + '/' + service + '.asmx?wsdl' )
		.then( function( client ) {
			// add api key credentials, if provided
			if ( self.sourceCredentials.authentication.apiKey ) {
				client.addHttpHeader( 'API-key', self.sourceCredentials.credentials.apiKey );
			}

			Promise.promisifyAll( client );
			self.service = client; 

			// Add Service Functions to the Class
			var description = client.describe(); 
			for ( var service in description ) { 
				for ( var port in description[ service ] ) {
					for ( var fcn in description[ service ][ port ] ) { 
						if ( self[ fcn ] === undefined ) { // Only create function if name is not taken.
							// Defines the standard funtion, with extracted results
							self[ fcn ] = self._defineMethod( fcn, description[ service ][ port ][ fcn ], true );
						}

						if ( self[ fcn + 'Response' ] === undefined ) { // Only create function if name is not taken.
							// Defines the full function, returning the entire reponse, without extracting results
							self[ fcn + 'Response' ] = self._defineMethod( fcn, description[ service ][ port ][ fcn ], false );
						}
					}
				}
			}
	
			self.emit( 'initialized' );
		} )
		.catch( function( err ) {
			throw err;
		} ); 

}

// Array of meta info keys common to all responses
mbo_Service.metaInfoKeys = [ 
	'Status',
	'ErrorCode',
	'Message',
	'XMLDetail',
	'ResultCount',
	'CurrentPageIndex',
	'TotalPageCount',
	'targetNSAlias',
	'targetNamespace'
];

/**
 * Enables or disables the logging of calls to the API.
 *
 * @param {string|boolean} type The type of Logger to use -- 'local' or 'remote' --
 *		or false to disable.
 * @param {string} 
 * 
 * @throws {Error}
 */
mbo_Service.prototype.log = function( type, path, host, port ) {
	try {
		this.mboLogger = ( type === false ) ? undefined : new mboLogger( type, this.name );
		this.mboLogger.setPath( path );

		// remote only
		if( type === 'remote' ) {
			this.mboLogger.setHost( host, port );
		}
	}
	catch( err ) {
		throw err;
	}
}

/**
 * Sets the User Credentials to use for any call, and sets them to be used.
 * Not all calls require user credentials.
 * 
 * @param {string} username The username of the MINDOBDY client you're interacting with.
 * @param {string} password The password of the MINDBODY client you're interacting with.
 * @param {number|number[]} siteIds  A single, or array of, Site ID(s) which the client can interact with.
 */
mbo_Service.prototype.setUserCredentials = function( username, password, siteIds ) {
	if ( this._useDefaultUserCredentials ) {
		this._useDefaultUserCredentials = false;
	}

	this.userCredentials = new Credentials( { username: username, password: password } );

	if ( siteIds ) {
		this.addSiteIds( siteIds );
	}
};

/**
 * Sets the default credentials to the default value.
 * This appends an underscore before the Source Name, and uses the Source's password.
 *
 * @param {boolean} val Whether to use the defualt User Credentials or not [Default: true]
 */
mbo_Service.prototype.useDefaultUserCredentials = function( val ) {
	if ( typeof val === 'undefined' ) {
		val = true;
	}

	this._useDefaultUserCredentials = !!val;
};

/**
 * Adds Site Ids to the current users accessible sites.
 * @param {number|number[]} siteIds A single, or array of, Site ID(s) which the client can interact with.
 */
mbo_Service.prototype.addSiteIds = function( siteIds ) {
	if ( this.userCredentials ) {
		this.userCredentials.addSiteIds( siteIds );
	}
	
	this.sourceCredentials.addSiteIds( siteIds ); // Syncs User and Source Site Ids
};

/**
 * Gets or Sets defaults passed to every request.
 * If second argument is included, the key is set to that value.
 * If the second parameter is not included, the current value of the key is returned.
 * 
 * @param {string} name The key of the default parameter to get or set
 * @param {string} [value] The value to set the key to.
 * @return {string} If getting a value the value is returned. If setting a value, nothing is returned.
 */
mbo_Service.prototype.defaultParam = function( key, value ) {
	if ( typeof value === 'undefined' ) { // Getter
		return this.requestDefaults[ key ];
	}
	else { // Setter
		this.requestDefaults[ key ] = value.toString();
	}
};

mbo_Service.prototype._setUserCredentialsToDefault = function() {
	var username 	= '_' + this.sourceCredentials.username,
		password 	= this.sourceCredentials.password,
		siteIds 	= this.sourceCredentials.siteIds;

	if ( siteIds.length === 1 && siteIds[ 0 ] === -99 ) {
		// For Test site only, Default username doesn't have '_' prefixed
		username = 'Siteowner';
		password = 'apitest1234';
	}

	this.userCredentials = new Credentials( {
		username: username, 
		password: password 
	} );

	this.userCredentials.addSiteIds( siteIds )
};

/**
 * Defines a method to be added to the Service.
 * @param  {string} name           The name of the SOAP method to be wrapped.
 * @param  {Object} signature      The SOAP method's signature including the input parameters, and output object.
 * @param  {boolean} extractResults Whether the method should attempt to automatically extract the desired result or not.
 * @return {function}                Returns the wrapped SOAP method.
 *
 * @throws {SOAPError} If response code is not 200 Success.
 */
mbo_Service.prototype._defineMethod = function( name, signature, extractResults ) {
	var self = this;
	return function( args ) {
		var params = { Request: {} };

		// api versions less than 6.0 use SOAP credentials informtation
		if ( self.apiVersion < 6.0 ) {
			params.Request.SourceCredentials = self.sourceCredentials.toSOAP();
		}

		if ( self._useDefaultUserCredentials ) {
			self._setUserCredentialsToDefault();
		}
		
		if ( self.userCredentials ) {
			params.Request.UserCredentials = self.userCredentials.toSOAP() 
		}
 
		for ( var dflt in self.requestDefaults ) { // Default arguments
			params.Request[ dflt ] = self.requestDefaults[ dflt ];
		}

		for ( var arg in args ) { // Passed in arguments
			params.Request[ arg ] = args[ arg ];
		}

		// use api key
		var multikey = false;
		if ( self.sourceCredentials.authentication.apiKey ) { 
			if ( self.sourceCredentials.siteIds.length === 1 ) { 
				// only one site id, add as header and continue normally
				self.service.addHttpHeader( 'SiteId', self.sourceCredentials.siteIds[ 0 ] );
			}
			else {
				multikey = true;
			}
		}

		// Run the function
		var method = ( self.service[ name + 'Async' ] )( params )
			.spread( function( result, raw, header ) {

				// Logging
				if ( self.mboLogger ) {
					self.mboLogger.log( params, name, result );
				}

				// Check for Errors
				var res = result[ name + 'Result' ];
				if ( res.ErrorCode !== 200 ) { // SOAP Fault occured
					
					var fault = {
						Status: 	res.Status,
						ErrorCode: 	res.ErrorCode,
						Message: 	res.Message
					};

					throw new SOAPError( fault.ErrorCode, '[ErrorCode ' + fault.ErrorCode + '] ' + fault.Message );
				}
				else { // Successful Request, No Errors, so extract results
					return Promise.resolve( [ result, raw, header ] );
				}
			} )
			.spread( function( result, raw, header ) {
				if ( extractResults ) { // Extract Relevant info
					if ( name.substr( 0, 3 ) === 'Get' ) { // Function is a Getter, Extract relevant results
						return self._extractGetterResults( result[ name + 'Result' ] );
					}
					else { // Function performs an action with Side effects, Extract non-meta info
						return self._extractActionResults( result[ name + 'Result' ] );
					}	
				}
				else { // Return raw result
					return [ result, raw, header ];
				}
			} )
			.catch(	function( err ) {
				if ( err instanceof Error ) { // Rethrow error
					throw err;
				}
				else {
					return self._defaultSoapErrorHandler( err );
				} 
			} );

		if ( multikey ) {
			// TODO
			// more than one site id used with api key, run method for each
			return Promise.reject( 
				new TypeError ( 
					'Can not use multiple site ids with api key authentication.' 
				)
			);
		}
		else {
			// no api key provided
			return method;
		}
	};
};

/**
 * Check if the SOAP call returned a SOAP Fualt.
 * Triggers a 'SoapFault' event if found.
 *
 * @deprecated MBO Services respond with status codes instead of SOAP Faults.
 * @param  {object} result The object representation of the SOAP response.
 * @return {boolean}        Whether the response contained a SOAP Fault of not.
 */
mbo_Service.getSoapFault = function( result ) {
	for ( var key in result ) {
		if ( 'Status' in result[ key ] ) {
			if ( result[ key ].ErrorCode === 200 ) { // No error
				return false;
			}
			else { // Error
				this.emit( 'SoapFault', fault );

				return { 
					ErrorCode: result[ key ].ErrorCode,
					Status: result[ key ].Status,
					Message: result[ key ].Message
				};
			}
		}
	}
};

/* Default SOAP Error Handler. To be used if SOAP request returns a SOAPFault.
 * 
 */
mbo_Service.prototype._defaultSoapErrorHandler = function( err ) {
	console.error( err );
	return Promise.reject( err );
};

/**
 * Attempts to exract the results from an API request.
 * It does this by eliminating all metadata.
 * 	
 * @param  {Object} result The Object representation of the SOAP response.
 * @return {string|number|Array}        Returns either an Array of results or,
 *                                              if only 1 non-metadata element existed in the
 *                                              response, returns the actual data.
 */
mbo_Service.prototype._extractGetterResults = function( result ) {
	for ( var resultKey in result ) { 
		if ( mbo_Service.metaInfoKeys.indexOf( resultKey ) === -1 ) { 
		// Key is not meta info, meanining it contains the results we're interested in

			var extracted = {};
			for ( var key in result[ resultKey ] ) {
				if ( mbo_Service.metaInfoKeys.indexOf( key ) === -1 ) {
				// Again, key is not meta info, it must be the result we want

					extracted[ key ] = result[ resultKey ][ key ];
				}
			}

			var extractedKeys = Object.keys( extracted );
			if ( extractedKeys.length === 1 ) { // Only one result to return, Return raw result
				return Promise.resolve( extracted[ extractedKeys[ 0 ] ] ); 
			}
			else { // More than one result, return whole object
				return Promise.resolve( extracted ); 
			}
		}
	}

	// Couldn't find a result
	return Promise.reject( 
		new OperationalError ( '[ErrorCode 701] Could not extract results. Try using the service function instead.' )
	);
};

/**
 * Extracts the results from an API call with a side effect.
 * @param  {object} result The Object representation of a SOAP response.
 * @return {Array}        An array containing any non-metadata from the response.
 */
mbo_Service.prototype._extractActionResults = function( result ) {
	var extracted = { ResultCount: result.ResultCount };

	for ( var resultKey in result ) {
		if ( mbo_Service.metaInfoKeys.indexOf( resultKey ) === -1 ) { 
		// Key is not meta info, meanining it contains a result we're interested in
			extracted[ resultKey ] = result[ resultKey ];
		}
	}

	return Promise.resolve( extracted );
};

mbo_Service.prototype.toString = function() {
	return '[object mbo_Service] {' +
			'service: ' + this.service + ', ' +
			'sourceCredentials: ' + this.sourceCredentials + ', ' +
			'userCredentials: ' + this.userCredentials + ', ' +
			'ready: ' + this.ready + ', ' +
			'requestDefaults: ' + this.requestDefaults + '}';
}

//------------ Event Methods -------------------

mbo_Service.prototype.on = function( event, listener ) {
	this.emitter.on( event, listener );
};

mbo_Service.prototype.once = function( event, listener ) {
	this.emitter.on( event, listener );
}

mbo_Service.prototype.emit = function( event ) {
	this.emitter.emit( event );
};

module.exports = mbo_Service;