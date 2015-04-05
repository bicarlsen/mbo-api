/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a base class for interacting with the actual 
 * MINDBODY services: Client, Class, Sale, Staff, and Site.
 */

var	EventEmitter = require( 'events' ).EventEmitter,
	soap = require( 'soap' ),
	Promise = require( 'bluebird' ),
	OperationalError = Promise.OperationalError;

var Credentials = require( '../classes/mbo_Credentials' ),
	SOAPError = require( '../classes/SOAPError' );

Promise.promisifyAll( soap );

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
 * @param  {string} service        The full name of the service to be implemented. E.g 'SaleService'
 * @param  {string} sourceName     Your MINDBODY developer Source Name, included in all service calls.
 * @param  {string} sourcePassword Your MINDBODY developer Source Password, included in all service calls. 
 * @return {mbo_Service} An absract service to interact with the MINDBODY API service.
 */	
function mbo_Service( service, sourceName, sourcePassword ) {
	var self = this;
	this.emitter = new EventEmitter();
	
	this.ready = false;
	this.on( 'ready', function() { self.ready = true; } );

	this.sourceCredentials = new Credentials( sourceName, sourcePassword, [], 'source' );
	this.userCredentials = undefined;

	// Request Defaults
	this.requestDefaults = {
		XMLDetail: 'Full',
		PageSize: '1000' 
	};

	// Setup SOAP Client 
	soap.createClientAsync( 'https://api.mindbodyonline.com/0_5/' + service + '.asmx?wsdl' )
		.then( function( client ) {
			Promise.promisifyAll( client );
			self.service = client; 

			// Add Service Functions to the Class
			var description = client.describe(); 
			for ( var service in description ) { 
				for ( var port in description[ service ] ) {
					for ( var fcn in description[ service ][ port ] ) { 
						// Defines the standard funtion, with extracted results
						self[ fcn ] = self._defineMethod( fcn, description[ service ][ port ][fcn], true );

						// Defines the full function, returning the entire reponse, without extracting results
						self[ fcn + 'Response' ] = self._defineMethod( fcn, description[ service ][ port ][fcn], false );
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
 * Sets the User Credentials to use for any call.
 * Not all calls require user credentials.
 * 
 * @param {string} username The username of the MINDOBDY client you're interacting with.
 * @param {string} password The password of the MINDBODY client you're interacting with.
 * @param {number|number[]} siteIds  A single, or array of, Site ID(s) which the client can interact with.
 */
mbo_Service.prototype.setUserCredentials = function( username, password, siteIds ) {
	this.userCredentials = new Credentials( username, password );
	this.addSiteIds( siteIds );
};

/**
 * Adds Site Ids to the current users accessible sites.
 * @param {number|number[]} siteIds A single, or array of, Site ID(s) which the client can interact with.
 */
mbo_Service.prototype.addSiteIds = function( siteIds ) {
	this.userCredentials.addSiteIds( siteIds );
	this.sourceCredentials.addSiteIds( siteIds ); // Syncs User and Source Site Ids
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
		var params = {
			Request: {
				SourceCredentials: self.sourceCredentials.toSOAP(),
				UserCredentials: self.userCredentials.toSOAP()
			}
		};
 
		for ( var dflt in self.requestDefaults ) { // Default arguments
			params.Request[ dflt ] = self.requestDefaults[ dflt ];
		}

		for ( var arg in args ) { // Passed in arguments
			params.Request[ arg ] = args[ arg ];
		}

		// Run the function
		return ( self.service[ name + 'Async' ] )( params )
			.spread( function( result, raw, header ) {

				// Check for Errors
				if ( result[ name + 'Result' ].ErrorCode !== 200 ) { // SOAP Fault occured
					
					var fault = {
						Status: result[ name + 'Result' ].Status,
						ErrorCode: result[ name + 'Result' ].ErrorCode,
						Message: result[ name + 'Result' ].Message
					};

					throw new SOAPError( '[ErrorCode ' + fault.ErrorCode + '] ' + fault.Message );
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
				else{
					return self._defaultSoapErrorHandler( err );
				} 
			} );
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
		new OperationalError ( '[ErrorCode 701] Could not extract results. Try using the service function instead' )
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

//------------ Event Methods -------------------

mbo_Service.prototype.on = function( event, listener ) {
	this.emitter.on( event, listener );
};

mbo_Service.prototype.emit = function( event ) {
	this.emitter.emit( event );
};

module.exports = mbo_Service;