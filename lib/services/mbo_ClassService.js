/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a wrapper to the MINDBODY Class Service, providing 
 * some additional functionality.
 *
 * All Class Service methods are available returning
 * 1) An extracted result using the instance method with the same name
 * 2) The raw array response using the instance method with the same name post-fixed with 'Response'.
 * 		The array consists of:
 * 			i) 		The object represtentation of the SOAP response
 * 			ii) 	The raw XML SOAP response
 * 			iii) 	The raw header info of the SOAP response
 */

var Promise = require( 'bluebird' );

var mboService 	= require( './mbo_Service' );

//--------------- ClassService Class ---------------------

/**
 * Represents the MINDOBDY Class Service.
 *
 * @constructor
 * @param  {object|Credentials} credentials MINDBODY authentication credentials.
 *
 * @return {mbo_ClassService}          Returns the Class Service.
 */
function mbo_ClassService( credentials ) {
	mboService.call( this, 'ClassService', credentials );
}
mbo_ClassService.prototype = Object.create( mboService.prototype );
mbo_ClassService.prototype.constructor = mbo_ClassService;

/**
 * Gets the IDs of all clients in a given class.
 * 
 * @param  {number} classId The ID of the class to inspect.
 * @return {Promise}         An A+ promise passed an array of client IDs who attended the class.
 */
mbo_ClassService.prototype.getClassAttendees = function( classId ) {
	return this.GetClassVisits( { ClassID: classId } )
		.then( function( response ) {
			if( response.Visits === null ) {
				// no sign ins
				response.Visits = { Visit: [] };
			}

			var clients = [];
			for ( var i in response.Visits.Visit ) {
				clients.push( response.Visits.Visit[ i ].Client.ID );
			}

			return clients;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

module.exports = mbo_ClassService;