var USERNAME = 'Siteowner',
	PASSWORD = 'apitest1234',
	SITEID = -99;


// User Credentials
var Credentials = require( '../lib/classes/mbo_Credentials' );
var creds = new Credentials( USERNAME, PASSWORD, SITEID );

// mbo_Service
var Service = require( '../lib/services/mbo_Service' );


// Client Service

var factory = require( '../lib/mbo_ServiceFactory' );

factory.setSourceCredentials( 'MBOReports', '2imT8ldj48KsOfXppxppGc0Dk7U=' );

var clientService = factory.createClientService( USERNAME, PASSWORD, SITEID );

clientService.on( 'ready', function() {

	clientService.getClientCount()
		.then( function( response ) {
			console.log( response )
		} )
		.catch( function( err ) { 
			console.error( err ) 
		} ); 
} );
