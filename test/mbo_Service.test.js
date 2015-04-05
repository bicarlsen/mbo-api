var MBOService = require( '../lib/services/mbo_Service.js' ),
	should = require( 'should' );

var service;
var SOURCENAME = 'MBOReports',
	SOURCEPASSWORD = '2imT8ldj48KsOfXppxppGc0Dk7U=';

describe( 'MBO Service Unit Tests:', function() {
	beforeEach( function( done ) {
		service = new MBOService( SOURCENAME, SOURCEPASSWORD );

		done();
	} );
} );