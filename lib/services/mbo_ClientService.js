var soap = require( 'soap' ),
	Promise = require( 'bluebird' );

Promise.promisifyAll( soap );

var mboService = require( './mbo_Service' ),
	Client = require( '../classes/mbo_Client' );

//--------------- ClientService Class ---------------------

function mbo_ClientService( username, password ) {
	mboService.call( this, 'ClientService', username, password );
}
mbo_ClientService.prototype = Object.create( mboService.prototype );
mbo_ClientService.prototype.constructor = mbo_ClientService;

//------------- Methods ----------------------

/* Retrieves the number of clients */
mbo_ClientService.prototype.getClientCount = function() {
	var args = {
		SearchText: '',
		PageSize: 1,
		XMLDetail: 'Bare'
	};

	return this.GetClients( args )
		.spread( function( result, raw, header ) {
			return result.GetClientsResult.ResultCount;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/* Retrieves all clients
 * Returns an array of MBO Clients
 */
mbo_ClientService.prototype.getAllClients = function() {
	this.getClientCount()
		.then( function( clientCount ) {
			var clients = [],
				pages = 0,
				completed = 0;

			var args = {
				SearchText: ''
			};

			return this.GetClients( args )
				.spread( function( result, raw, header ) {
					return result.GetClientsResult.Clients.Client;
				} )
				.catch( function( err ) {
					throw err;
				} );
		} )
		.catch( function( err ) {
			throw err;
		} );
};

module.exports = mbo_ClientService;