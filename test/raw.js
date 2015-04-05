var USERNAME = 'Siteowner',
	PASSWORD = 'apitest1234',
	SITEID = -99;

var EASTON_USERNAME = 'briancarlsen',
	EASTON_PASSWORD = 'Bicpens1',
	EASTON_SITEID = 5586;

var SOAPError = require( '../lib/classes/SOAPError' );

// User Credentials
var Credentials = require( '../lib/classes/mbo_Credentials' );
var creds = new Credentials( USERNAME, PASSWORD, SITEID );

// mbo_Service
var Service = require( '../lib/services/mbo_Service' );


var factory = require( '../lib/mbo_ServiceFactory' );
factory.setSourceCredentials( 'MBOReports', '2imT8ldj48KsOfXppxppGc0Dk7U=' );


// Class Service

var classService = factory.createClassService( USERNAME, PASSWORD, SITEID );
/*
classService.on( 'ready', function() {

	classService.getClassAttendees( 24376 )
		.then( function( response ) {
			console.log( response )
		} )
		.catch( function( err ) { 
			console.error( 'Error:', err ) 
		} ); 
} );
*/

// Client Service
/*
var clientService = factory.createClientService( USERNAME, PASSWORD, SITEID );

clientService.on( 'ready', function() {

	clientService.GetClients(  )
		.then( function( response ) {
			console.log( response )
		} )
		.catch( function( err ) { 
			console.error( 'Error:', err ) 
		} ); 
} );
*/

// Site Service

var siteService = factory.createSiteService( USERNAME, PASSWORD, SITEID );

siteService.on( 'ready', function() {

	siteService.getActivationCodes()
		.then( function( response ) {
			console.log( response );
		} )
		.catch( function( err ) {
			console.error( 'Error:', err );
		} );
} );
