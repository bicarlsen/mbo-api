var USERNAME = 'Siteowner',
	PASSWORD = 'apitest1234',
	SITEID = -99;

var EASTON_USERNAME = 'briancarlsen',
	EASTON_PASSWORD = 'Bicpens1',
	EASTON_SITEID = 5586;

var SOURCENAME = 'MBOReports',
	SOURCE_PASSWORD = '2imT8ldj48KsOfXppxppGc0Dk7U=';

var SOAPError = require( '../lib/classes/SOAPError' );

// User Credentials
var Credentials = require( '../lib/classes/mbo_Credentials' );
var creds = new Credentials( USERNAME, PASSWORD, SITEID );

// mbo_Service
var Service = require( '../lib/services/mbo_Service' );


var factory = require( '../lib/mbo_ServiceFactory' );
factory.setSourceCredentials( SOURCENAME, SOURCE_PASSWORD );


// Class Service
/*
var classService = factory.createClassService( USERNAME, PASSWORD, SITEID );

classService.on( 'ready', function() {
	var params = {
		ClientID: '100015112'
	}

	classService.GetClientVisits( params )
		.then( function( response ) {
			console.log( response );
			//console.log( response[0].GetClassesResult.Classes );
		} )
		.catch( function( err ) { 
			console.error( 'Error:', err ) 
		} ); 
} );
*/


factory.createClassServiceAsync()
	.then( function( service ) {
		var date = '2015-08-01';
		var params = {
			ClassID: '21312'
		};

		//service.useDefaultUserCredentials = true;
		service.useDefaultUserCredentials();
		service.addSiteIds( -99 ); 

		return service.GetClassVisits( params );
	} )
	.then( function( response ) {
		console.log( response.Visits );
	} )
	.catch( function( err ) { 
		console.error( 'Error:', err );
	} ); 

 

// Client Service
/*
var clientService = factory.createClientService();
clientService.useDefaultUserCredentials();
clientService.addSiteIds( 5586 )

clientService.on( 'ready', function() {
	var params = {
		ClientID: '1123'
	};

	clientService.GetClients( '', params )
		.then( function( response ) {
			console.log( response );
		} )
		.catch( function( err ) { 
			console.error( 'Error:', err ) 
		} ); 
} );
*/

// Site Service
/*
var siteService = factory.createSiteService( USERNAME, PASSWORD, SITEID);

siteService.on( 'ready', function() {

	siteService.GetPrograms()
		.then( function( response ) {
			console.log( response );
		} )
		.catch( function( err ) {
			console.error( 'Error:', err );
		} );
} );
*/

// Sale Service
/*
var saleService = factory.createSaleService( USERNAME, PASSWORD, SITEID );

saleService.on( 'ready', function() {
	var params = {
		StartSaleDateTime: 	"2015-07-24T00:00:00Z", 
		EndSaleDateTime: 	"2015-07-24T23:00:00Z"
	};

	saleService.GetSales( params )
		.then( function( response ) {
			console.log( response );
		} )
		.catch( function( err ) {
			console.error( 'Error:', err );
		} );
} );
*/

// Staff Service
/*
var staffService = factory.createStaffService( EASTON_USERNAME, EASTON_PASSWORD, EASTON_SITEID );

staffService.on( 'ready', function() {

	staffService.GetStaff(  )
		.then( function( response ) {
			console.log( response );
		} )
		.catch( function( err ) {
			console.error( 'Error:', err );
		} );
} );
*/