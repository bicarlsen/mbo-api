/**
 * @author Brian Carlsen
 * @version 1.0.0
 *
 * Serves as a wrapper to the MINDBODY Client Service, providing 
 * some additional functionality.
 *
 * All Client Service methods are available returning
 * 1) An extracted result using the instance method with the same name
 * 2) The raw array response using the instance method with the same name post-fixed with 'Response'.
 * 		The array consists of:
 * 			i) 		The object represtentation of the SOAP response
 * 			ii) 	The raw XML SOAP response
 * 			iii) 	The raw header info of the SOAP response
 */

var Promise = require( 'bluebird' );

var mboService = require( './mbo_Service' );

//--------------- ClientService Class ---------------------

/**
 * Represents the MINDOBDY Client Service.
 *
 * @constructor
 * @param  {object|Credentials} credentials MINDBODY authentication credentials.
 *
 * @return {mbo_ClientService}          Returns the Client Service.
 */
function mbo_ClientService( credentials ) {
	mboService.call( this, 'ClientService', credentials );
}
mbo_ClientService.prototype = Object.create( mboService.prototype );
mbo_ClientService.prototype.constructor = mbo_ClientService;

//------------- Methods ----------------------

/**
 * Retrieves the number of clients.
 * @param  {string} [search] Search string to filter results.
 * @return {Promise}        An A+ Promise passed the total number of clients, 
 *                             matching the search string if given. 
 */
mbo_ClientService.prototype.getClientCount = function( search ) {
	var args = {
		SearchText: search || '',
		PageSize: 1,
		XMLDetail: 'Bare'
	};

	return this.GetClientsResponse( args )
		.spread( function( result, raw, header ) { 
			return result.GetClientsResult.ResultCount;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/**
 * Retrieves all clients, filtered by search text if given.
 * @param  {string} [search] Search string to filter results.
 * @return {Promise}        An A+ Promise passed an array of the found clients.
 */
mbo_ClientService.prototype.getAllClients = function( search, params ) {
	var self = this;

	return self.getClientCount()
		.then( function( clientCount ) {
			var args = params || {};
			args.SearchText = search || '';

			var pageSize = args.PageSize || self.requestDefaults.PageSize,
				pages = Math.ceil( clientCount / pageSize ),
				completed = 0
				clientRequests = [];

			for ( var p = 0; p < pages; ++p ) { // Send all requests
				args.CurrentPageIndex = p;
				clientRequests.push( self.GetClients( args ) );
			}

			return clientRequests;
		} )
		.then( function( clientRequests ) {
			return Promise.all( clientRequests ) // Wait for all requests to complete
				.then( function( clientRequests ) { 
					var clients = [];

					for ( var i in clientRequests ) {
						clients = clients.concat( clientRequests[ i ] );
					}
					
					return clients;
				} )
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/**
 * Retireves the clients matching the given IDs
 * @param  {number|number[]} ids An single or array of client IDs to retrieve.
 * @return {Promise}     An A+ Promise passed an array of clients.
 */
mbo_ClientService.prototype.getClientsById = function( ids, params ) {
	var args = params || {};
	args.ClientIDs = {
		string: ids
	};

	// If more than 1000 clients, must break query into multiple pages
	var clientRequests = [],
		pages = Math.ceil( ids.length / 1000 );

	for ( var p = 0; p < pages; ++p ) {
		args.CurrentPageIndex = p;
		clientRequests.push( this.GetClients( args ) );
	}

	return Promise.all( clientRequests )
		.then( function( clientRequests ) {
			var clients = [];

			for ( var i in clientRequests ) {
				clients = clients.concat( clientRequests[ i ] );
			}

			return clients;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/**
 * Retrieves a single client by ID
 * @param  {number} id Teh ID of the requested client
 * @return {Promise}    An A+ Promise passed an object representing the client.
 */
mbo_ClientService.prototype.getClientById = function( id ) {
	return this.getClientsById( id )
		.then( function( clients ) {
			if ( clients.length === 1 ) {
				if ( clients[ 0 ].ID ) {
					return clients[ 0 ];
				}
				else {
					return false;
				}
			}
			else {
				throw new Error( 'More than one client found with same Id.' );
			}
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/**
 * Gets the values of Client Indexes for a client.
 * @param  {number|string} id The client's Id
 * @return {Promise}    Returns an A+ Promise resolved to an array of objects representing 
 *                            the client's assigned Client Index values.
 *                            Each object has the form { index: { id, name }, value: { id, name } }.
 *                            Client Indexes which do not have an assigned value are excluded.
 */
mbo_ClientService.prototype.getClientIndexValues = function( id ) {
	var params = {
		ClientIDs: { string: id },
		Fields: { string: [ 'Clients.ClientIndexes' ] }
	};

	return this.GetClients( params )
		.then( function( client ) {
			var indexValues = [],
				indexes = client[ 0 ].ClientIndexes.ClientIndex;

			if ( indexes ) {
				indexes.forEach( function( index ) {
					var value = index.Values.ClientIndexValue[ 0 ],
						indexValue = {
							index: {
								id: index.ID,
								name: index.Name
							},
							value: {
								id: value.ID,
								name: value.Name
							}
						};

					indexValues.push( indexValue );
				} );
			}
			
			return indexValues;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

/**
 * Retrieves Account Balances for Clients
 * @param  {array} ids An array of Client Ids
 * @return {Promise}     An A+ Promise resolved to an object keyed by client Id and values of thier
 *                         Account Balance
 */
mbo_ClientService.prototype.getClientAccountBalancesById = function( ids ) {
	var self = this,
		pages = Math.ceil( ids.length / self.requestDefaults.PageSize ),
		completed = 0
		balanceRequests = [];

	for ( var p = 0; p < pages; ++p ) { // Send all requests
		var idStart = p * self.requestDefaults.PageSize,
			idEnd 	= ( p + 1 ) * self.requestDefaults.PageSize
			pageIds = ids.slice( idStart, idEnd );

		var args = {
			XMLDetail: 'Bare',
			CurrentPageIndex: p,
			ClientIDs: { string: pageIds }
		};

		balanceRequests.push( self.GetClientAccountBalances( args ) );
	}

	return Promise.all( balanceRequests ) // Wait for all requests to complete
		.then( function( balanceRequests ) {
			var balances = {};

			balanceRequests.forEach( function( balanceRequest ) {  
				balanceRequest.forEach( function( balance ) {
					balances[ balance.ID ] = parseFloat( balance.AccountBalance );
				} );
			} );

			return balances;
		} )
		.catch( function( err ) {
			throw err;
		} );
};

module.exports = mbo_ClientService;