var serviceFactory 		= require( '../lib/mbo_ServiceFactory.js' ),
	soap 				= require( 'soap' ),
	Promise 			= require( 'bluebird' ),
	should 				= require( 'should' )
	log 				= require( 'fancy-log' );

var service,
	functionNames;

var SOURCE_NAME 		= process.env.mbo_source_name,
	SOURCE_PASSWORD 	= process.env.mbo_source_pass,
	USER_NAME 			= process.env.mbo_user_name,
	USER_PASSWORD 		= process.env.mbo_user_pass,
	SITE_ID 			= process.env.mbo_site_id;

describe( 'MBO Client Service Unit Tests:', function() {

	before( function( done ) {
		serviceFactory.setSourceCredentials( SOURCE_NAME, SOURCE_PASSWORD );
		done();
	} );

	before( function( done ) {
		// Get WSDL description
		soap.createClientAsync( 'https://api.mindbodyonline.com/0_5/ClientService.asmx?wsdl' )
			.then( function( client ) {
				Promise.promisifyAll( client );
				var description = client.describe();

				// For each method in WSDL check the service has a matcing funciton
				// and one with 'Response' appended
				functionNames = [];
				for ( var svc in description ) { 
					for ( var port in description[ svc ] ) {
						for ( var fcn in description[ svc ][ port ] ) {
							functionNames.push( fcn );
						}
					}
				}

				done();
			} )
			.catch( function( err ) {
				throw err;
			} );
	} );

	beforeEach( function( done ) {
		service = serviceFactory.createClientService( USER_NAME, USER_PASSWORD, SITE_ID );

		service.on( 'ready', function() {
			done();
		} );
	} );

	describe( 'Function creation from the WSDL', function() {

		it( 'Should have instance methods matching those of the WSDL', function( done ) {
				service.should.have.properties( functionNames );
				done();
		} );

		it( 'Should have instance methods matching those of the WSDL with "Response" appended', function( done ) {
				respNames = functionNames.map( function( name ) {
					return name + 'Response';
				} );

				service.should.have.properties( respNames );
				done();
		} );
	} );

	describe( 'Custom functions', function() {
		
		describe( 'Get Client Count function', function() {
			it( 'Should have a method #getClientCount', function( done ) {
				service.should.have.property( 'getClientCount' );
				done();
			} );

			it( 'Should return a Promise passed a number', function( done ) {
				this.timeout( 10000 );

				service.getClientCount()
					.then( function( count ) {
						count.should.be.greaterThan( -1 );

						done();
					} )
					.catch( function( err ) {
						throw err;
					} );
			} );
		} );

		describe( 'Get All Clients function', function() {
			it( 'Should have a method #getAllClients', function( done ) {
				service.should.have.property( 'getAllClients' );
				done();
			} );

			it( 'Should return a Promise passed an Array', function( done ) {
				this.timeout( 20000 );
				
				service.getAllClients()
					.then( function( clients ) {
						clients.should.be.an.Array;

						done();
					} )
					.catch( function( err ) {
						throw err;
					} );
			} );
		} );

		describe( 'Get Clients By Id function', function() {
			it( 'Should have a method #getClientsById', function( done ) {
				service.should.have.property( 'getClientsById' );
				done();
			} );

			it( 'Should return a Promise passed an Array', function( done ) {
				this.timeout( 15000 );
				
				// Get Client Ids
				service.GetClients( { SearchText: '' } )
					.then( function( clients ) {
						var ids = [];
						for ( var i in clients ) {
							ids.push( clients[ i ].ID );
						}

						return ids;
					} )
					.then( function( ids ) {
						return service.getClientsById( ids );
					} )
					.then( function( clients ) {
						clients.should.be.an.Array;

						done();
					} )
					.catch( function( err ) {
						throw err;
					} );
			} );
		} );

		describe( 'Get Client By Id function', function() {
			it( 'Should have a method #getClientById', function( done ) {
				service.should.have.property( 'getClientById' );
				done();
			} );

			it( 'Should return a Promise passed an Object', function( done ) {
				this.timeout( 15000 );
				
				// Get Client Ids
				service.GetClients( { SearchText: '' } )
					.then( function( clients ) {
						return clients[ 0 ].ID;
					} )
					.then( function( ids ) {
						return service.getClientById( ids );
					} )
					.then( function( client ) {
						client.should.be.an.Object;

						done();
					} )
					.catch( function( err ) {
						throw err;
					} );
			} );
		} );
	} );
} );