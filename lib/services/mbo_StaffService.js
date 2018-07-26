/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a wrapper to the MINDBODY Staff Service, providing 
 * some additional functionality.
 *
 * All Staff Service methods are available returning
 * 1) An extracted result using the instance method with the same name
 * 2) The raw array response using the instance method with the same name post-fixed with 'Response'.
 * 		The array consists of:
 * 			i) 		The object represtentation of the SOAP response
 * 			ii) 	The raw XML SOAP response
 * 			iii) 	The raw header info of the SOAP response
 */

var Promise = require( 'bluebird' );

var mboService = require( './mbo_Service' );

//--------------- StaffService Class ---------------------


/**
 * Represents the MINDOBDY Staff Service.
 *
 * @constructor
 * @param  {object|Credentials} credentials MINDBODY authentication credentials.
 * 
 * @return {mbo_StaffService}          Returns the Staff Service.
 */
function mbo_StaffService( credentials ) {
	mboService.call( this, 'StaffService', credentials );
}
mbo_StaffService.prototype = Object.create( mboService.prototype );
mbo_StaffService.prototype.constructor = mbo_StaffService;


module.exports = mbo_StaffService;