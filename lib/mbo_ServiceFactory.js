/**
 * @author  Brian Carlsen
 * @version  1.0.0
 *
 * A factory for creating MINDBODY Services
 *
 * Emits a 'ready' event on the service after initialization.
 */

var Credentials 		= require( './classes/mbo_Credentials' ),
	Promise 			= require( 'bluebird' ),
	OperationalError 	= Promise.OperationalError;

var mbo_ClientService	= require( './services/mbo_ClientService' ),
	mbo_ClassService	= require( './services/mbo_ClassService' )
	mbo_StaffService	= require( './services/mbo_StaffService' ),
	mbo_SaleService		= require( './services/mbo_SaleService' ),
	mbo_SiteService		= require( './services/mbo_SiteService' );

/**
 * Sets the SOURCENAME and PASSWORD to be used with all requests.
 * 
 * @param {string} username Your MINDBODY developer's Sourcename
 * @param {string} password Your MINDBODY developer's Password
 */
module.exports.setSourceCredentials = function( sourcename, password ) {
	if ( ! this.credentials  ) {
		this.credentials = new Credentials( {
				username: sourcename,
				password: password
			}, 
			undefined, 
			'source' 
		);
	}
	else {
		this.credentials.setSourceCredentials( sourcename, password );
	}
};

/**
 * Sets the API Key to be used with all requests.
 *
 * @param {string} apiKey Your MINDBODY API Key
 */
module.exports.setApiKey = function( apiKey ) {
	if ( ! this.credentials  ) {
		this.credentials = new Credentials( {
				apiKey: apiKey
			}, 
			undefined, 
			'source' 
		);
	}
	else {
		this.credentials.setApiKey( apiKey );
	}
} 

/**
 * Creates a service to interact with the MINDBODY Client Service API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_ClientService}          The service to interact with the MINDBODY API.
 */
module.exports.createClientService = function( username, password, siteIds ) {
	return _defineService( mbo_ClientService, username, password, siteIds );
};

/**
 * Creates a service to interact with the MINDBODY Client Service API asynchronously.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}          An A+ Promise, which resolves with the service to interact with the MINDBODY API.
 */
module.exports.createClientServiceAsync = function( username, password, siteIds ) {
	return _defineServiceAsync( mbo_ClientService, username, password, siteIds );
};

//-------------------------------------------//

/**
 * Creates a service to interact with the MINDBODY Class Service API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_ClassService}          The service to interact with the MINDBODY API.
 */
module.exports.createClassService = function( username, password, siteIds ) {
	return _defineService( mbo_ClassService, username, password, siteIds );
};

/**
 * Creates a service to interact with the MINDBODY Class Service API asynchronously.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}          An A+ Promise, which resolves with the service to interact with the MINDBODY API.
 */
module.exports.createClassServiceAsync = function( username, password, siteIds ) {
	return _defineServiceAsync( mbo_ClassService, username, password, siteIds );
};

//-------------------------------------------------------//

/**
 * Creates a service to interact with the MINDBODY Site Service API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_SiteService}          The service to interact with the MINDBODY API.
 */
module.exports.createSiteService = function( username, password, siteIds ) {
	return _defineService( mbo_SiteService, username, password, siteIds );
};

/**
 * Creates a service to interact with the MINDBODY Site Service API asynchronously.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}          An A+ Promise, which resolves with the service to interact with the MINDBODY API.
 */
module.exports.createSiteServiceAsync = function( username, password, siteIds ) {
	return _defineServiceAsync( mbo_SiteService, username, password, siteIds );
};

//---------------------------------------------------------//

/**
 * Creates a service to interact with the MINDBODY Staff Service API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_StaffService}          The service to interact with the MINDBODY API.
 */
module.exports.createStaffService = function( username, password, siteIds ) {
	return _defineService( mbo_StaffService, username, password, siteIds );
};

/**
 * Creates a service to interact with the MINDBODY Client Service API asynchronously.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}          An A+ Promise, which resolves with the service to interact with the MINDBODY API.
 */
module.exports.createStaffServiceAsync = function( username, password, siteIds ) {
	return _defineServiceAsync( mbo_StaffService, username, password, siteIds );
};

//-------------------------------------------//

/**
 * Creates a service to interact with the MINDBODY Sale Service API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_SaleService}          The service to interact with the MINDBODY API.
 */
module.exports.createSaleService = function( username, password, siteIds ) {
	return _defineService( mbo_SaleService, username, password, siteIds );
};


/**
 * Creates a service to interact with the MINDBODY Sale Service API asynchronously.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}          An A+ Promise, which resolves with the service to interact with the MINDBODY API.
 */
module.exports.createSaleServiceAsync = function( username, password, siteIds ) {
	return _defineServiceAsync( mbo_SaleService, username, password, siteIds );
};


//------ Internal Methods ------

/**
 * Sets up the Service.
 * 
 * @emits 	ready
 *
 * @param  {mbo_Service} serviceClass The service to be initialized.
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 *
 * @return {mbo_Service}              Returns an instantiated instance of the passed in Service class.
 *
 * @throws {Error} If no source authentication credentials have been set
 */
var _defineService = function( serviceClass, username, password, siteIds ) {
	var self = module.exports;

	if ( ! self.credentials.hasValidCredentials() ) {
		throw new Error( 'No valid authentication credentials are set.' );
	}

	var service = new serviceClass( self.credentials );
	service.on( 'initialized', function() {
		if ( username && password ) {
			service.setUserCredentials( username, password, siteIds );
		}
		
		service.emit( 'ready' );
	} );

	return service;
}

/**
 * Sets up the Service using Bluebird Promises.
 * 
 * @emits 	ready
 *
 * @param  {mbo_Service} serviceClass The service to be initialized.
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 *
 * @return {Promise}              Returns an A+ Promise passed an instantiated instance of the passed in Service class.
 */
var _defineServiceAsync = function( serviceClass, username, password, siteIds ) {
	var self = module.exports;

	return new Promise( function( resolve, reject ) {
		if ( ! self.credentials.hasValidCredentials() ) {
			throw new Error( 'Source credentials have not been set.' );
		}

		var service = new serviceClass( self.credentials )
		service.on( 'initialized', function() {
			if ( username && password ) {
				service.setUserCredentials( username, password, siteIds );
			}

			resolve( service );
		} );

		service.on( 'error', function( err ) {
			reject( err );
		} );
	} );
};
