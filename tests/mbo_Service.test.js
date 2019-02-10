var MBOService 	= require( '../lib/services/mbo_Service.js' ),
	should 		= require( 'should' ),
	log 		= require( 'fancy-log' );

var service,
	username 	= 'user',
	password 	= 'password',
	siteIds 	= [ -99 ];

var SOURCE_NAME 		= process.env.mbo_source_name,
	SOURCE_PASSWORD 	= process.env.mbo_source_pass;

describe( 'MBO Service Unit Tests:', function() {
	beforeEach( function( done ) {
		service = new MBOService( false, SOURCE_NAME, SOURCE_PASSWORD );
		done();
	} );

	describe( '#setUserCredentials', function() {
		it( 'should not use the default credentials', function( done ) {
			service.setUserCredentials( username, password ); 
			service._useDefaultUserCredentials.should.be.false;
			done();
		} );

		it( 'should set the user credentials to the given parameters', function( done ) {
			service.setUserCredentials( username, password );
			var creds = service.userCredentials;
			
			creds.username.should.equal( username );
			creds.password.should.equal( password );

			done();
		} );

		it( 'should add site ids if passed', function( done ) {
			service.setUserCredentials( username, password, siteIds );
			service.userCredentials.siteIds.should.eql( siteIds );

			done();
		} );	

	} );

	describe( '#addSiteIds', function() {
		it( 'should set the user credentials to include the given site ids', function( done ) {
			service.setUserCredentials( username, password );
			service.addSiteIds( siteIds );
			service.userCredentials.siteIds.should.eql( siteIds );

			done();
		} );

		it( 'should set the source credentials to include the given site ids', function( done ) {
			service.addSiteIds( siteIds );
			service.sourceCredentials.siteIds.should.eql( siteIds );

			done();
		} );
	} );

	describe( '#defaultParam', function() {
		describe( 'if only one parameter is passed', function() {
			it( 'should return the default parameter with the given name', function( done ) {
				service.defaultParam( 'XMLDetail' ).should.equal( 'Full' );
				done();
			} );
		} );

		describe( 'if two parameters are passed', function() {
			it( 'should set the default parameter with the given name to the given value', function( done ) {
				service.defaultParam( 'Detail', 'Basic');
				service.requestDefaults.Detail.should.equal( 'Basic' );

				done();
			} );
		} );
	} );

	describe( '#_setUserCredentialsToDefault', function() {
		describe( 'if using only the test site', function( doen ) {
			it( 'should set the user credentials to "Siteowner" and "apitest1234"', function( done ) {
				service.addSiteIds( -99 );
				service._setUserCredentialsToDefault();
				var creds = service.userCredentials;

				creds.username.should.equal( 'Siteowner' );
				creds.password.should.equal( 'apitest1234' );

				done();
			} );
		} );

		describe( 'if using sites other than the test site', function() {
			it( 'should set the user credentials to the Source credentials', function( done ) {
				service.addSiteIds( 5586 );
				service._setUserCredentialsToDefault();
				var creds = service.userCredentials;

				creds.username.should.equal( '_' + SOURCE_NAME );
				creds.password.should.equal( SOURCE_PASSWORD );

				done();
			} );
		} );

		it( 'should set the site ids to match the source credential site ids', function( done ) {
			var siteIds = [ -99, 5586 ];

			service.addSiteIds( siteIds );
			service._setUserCredentialsToDefault();
			service.userCredentials.siteIds.should.eql( siteIds );

			done();
		} );
	} );

	describe( '#_defineMethod', function() {
		// TODO
	} );
} );