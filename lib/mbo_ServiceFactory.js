/**
 * @author  Brina Carlsen
 * @version  1.0.0
 *
 * A factory for creating MINDBODY Services
 *
 * Emits a 'ready' event on teh service after initialization.
 */

var Promise = require( 'bluebird' ),
	OperationalError = Promise.OperationalError;

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
module.exports.setSourceCredentials = function( username, password ) {
	this.sourceName = username;
	this.sourcePassword = password;
};

/**
 * Creates a service to interact with the MINDBODY Client SErvice API.
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
 * Creates a service to interact with the MINDBODY Class SErvice API.
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
 * Creates a service to interact with the MINDBODY Site SErvice API.
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
 * Creates a service to interact with the MINDBODY Staff SErvice API.
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
 * Creates a service to interact with the MINDBODY Sale SErvice API.
 * 
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_SaleService}          The service to interact with the MINDBODY API.
 */
module.exports.createSaleService = function( username, password, siteIds ) {
	return _defineService( mbo_SaleService, username, password, siteIds );
};

//------ Internal Methods ------

/**
 * Sets up the Service.
 * 
 * @emits 	ready
 * @param  {mbo_Service} serviceClass The service to be initialized.
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {mbo_Service}              Returns an instantiated instance of the passed in Service class.
 */
var _defineService = function( serviceClass, username, password, siteIds ) {
	var self = module.exports;

	if ( !( self.sourceName && self.sourcePassword ) ) {
		throw new Error( 'Source credentials have not been set.' );
	}

	var service = new serviceClass( self.sourceName, self.sourcePassword )
	service.on( 'initialized', function() {
		service.setUserCredentials( username, password, siteIds );
		service.emit( 'ready' );
	} );

	return service;
}

// TODO: Create Async version
/**
 * Sets up the Service.
 * 
 * @emits 	ready
 * @param  {mbo_Service} serviceClass The service to be initialized.
 * @param  {string} username The Username of the MINDBODY client to be used with all requests.
 * @param  {string} password The Password of the MINDBODY client to be used with all requests.
 * @param  {number|Array} siteIds  The Site ID, or an Array of Site IDs to be used with all requests.
 * @return {Promise}              Returns an A+ Promise passed an instantiated instance of the passed in Service class.
 */
/*
var _createServiceAsync = function( serviceClass, username, password, siteIds ) {
	var self = this;

	if ( !( this.sourceName && this.sourcePassword ) ) {
		return Promise.reject( new OperationalError( 'Source credentials have not been set.' ) );
	}
	else {
		return new Promise( function( resolve, reject ) {
			var clientService = new mbo_ClientService( this.sourceName, this.sourcePassword );

			clientService.on( 'initialized', function() {
				clientService.setUserCredentials( username, password, siteIds );
				clientService.emit( 'ready' );
			} );

			clientService.on( 'ready', function() {return Promise.resolve( clientService ); } );
			clientService.on( 'error', reject );
		} );
	}
};
*/