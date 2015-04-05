/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a wrapper to the MINDBODY Site Service, providing 
 * some additional functionality.
 *
 * All Site Service methods are available returning
 * 1) An extracted result using the instance method with the same name
 * 2) The raw array response using the instance method with the same name post-fixed with 'Response'.
 * 		The array consists of:
 * 			i) 		The object represtentation of the SOAP response
 * 			ii) 	The raw XML SOAP response
 * 			iii) 	The raw header info of the SOAP response
 */

var soap = require( 'soap' ),
	Promise = require( 'bluebird' );

Promise.promisifyAll( soap );

var mboService = require( './mbo_Service' );

//--------------- ClientService Class ---------------------


/**
 * Represents the MINDOBDY Site Service.
 *
 * @constructor
 * @param  {string} username Username of the MINDBODY client interacting with the service.
 * @param  {string} password Password of the MINDBODY client interacting with the service.
 * @return {mbo_SiteService}          Returns the Site Service.
 */
function mbo_SiteService( username, password ) {
	mboService.call( this, 'SiteService', username, password );
}
mbo_SiteService.prototype = Object.create( mboService.prototype );
mbo_SiteService.prototype.constructor = mbo_SiteService;


/**
 * Retrieves activation codes for the Site required for API access.
 * These must be given to the site's owner to be granted access.
 * 
 * @return {Promise} An A+ Promise passed an object containing:
 *                      i)	code: The raw activation code
 *                      ii) link: The link to grant access
 */
mbo_SiteService.prototype.getActivationCodes = function() {
	return this.GetActivationCodeResponse()
		.spread( function( result, raw, header ) {
			return {
				code: result.GetActivationCodeResult.ActivationCode,
				link: result.GetActivationCodeResult.ActivationLink
			};
		} ) 
		.catch( function( err ) {
			throw err;
		} );
};

module.exports = mbo_SiteService;