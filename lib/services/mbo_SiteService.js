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

var Promise = require( 'bluebird' );

var mboService = require( './mbo_Service' );

//--------------- SiteService Class ---------------------


/**
 * Represents the MINDOBDY Site Service.
 *
 * @constructor
 * @param  {object|Credentials} credentials MINDBODY authentication credentials.
 * 
 * @return {mbo_SiteService}          Returns the Site Service.
 */
function mbo_SiteService( credentials ) {
	mboService.call( this, 'SiteService', credentials );
}
mbo_SiteService.prototype = Object.create( mboService.prototype );
mbo_SiteService.prototype.constructor = mbo_SiteService;


/**
 * Retrieves activation codes for the Site required for API access.
 * These must be given to the site's owner to be granted access.
 *
 * Overwrites the automatically generated function due to a non-standard response format.
 *
 * @override
 * @return {Promise} An A+ Promise passed an object containing:
 *                      i)	ActivationCode: The raw activation code
 *                      ii) ActivationLink: The link to grant access
 */
mbo_SiteService.prototype.GetActivationCode = function() {
	return this.GetActivationCodeResponse()
		.spread( function( result, raw, header ) {
			return {
				ActivationCode: result.GetActivationCodeResult.ActivationCode,
				ActivationLink: result.GetActivationCodeResult.ActivationLink
			};
		} ) 
		.catch( function( err ) {
			throw err;
		} );
};

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

/**
 * Returns whether or not the SourceCredentials have access to a site.
 * @param  {number}  id The id of the site to check.
 * @return {Promise}    Returns an A+ Promise resolved to true if the credentials have site access, false otherwise.
 */
mbo_SiteService.prototype.hasSiteAccess = function( id ) {
	return this.GetSitesResponse()
		.spread( function( result, raw, header ) {
			var sites 	= result.GetSitesResult.Sites.Site,
				access 	= false;

			sites.forEach( function( site ) {
				if ( site.ID === id ) {
					access = true;
				}
			} );

			return access;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

module.exports = mbo_SiteService;