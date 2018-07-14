var serviceFactory 		= require( '../lib/mbo_ServiceFactory.js' ),
	should 				= require( 'should' ),
	Promise 			= require( 'bluebird' ),
	log 				= require( 'fancy-log' );

var mbo_ClientService	= require( '../lib/services/mbo_ClientService' ),
	mbo_ClassService	= require( '../lib/services/mbo_ClassService' )
	mbo_StaffService	= require( '../lib/services/mbo_StaffService' ),
	mbo_SaleService		= require( '../lib/services/mbo_SaleService' ),
	mbo_SiteService		= require( '../lib/services/mbo_SiteService' );

var SOURCE_NAME 		= process.env.mbo_source_name,
	SOURCE_PASSWORD 	= process.env.mbo_source_pass,
	USER_NAME 			= process.env.mbo_user_name,
	USER_PASSWORD 		= process.env.mbo_user_pass,
	SITE_ID 			= process.env.mbo_site_id;


describe( 'MBO Service Factory Unit Tests:', function() {
	before( function( done ) {
		
		
		done();
	} );

	describe( '#setSourceCredentials', function() {
		it( 'should set source credentials of the factory', function( done ) {
			serviceFactory.setSourceCredentials( SOURCE_NAME, SOURCE_PASSWORD );
			serviceFactory.sourceName.should.equal( SOURCE_NAME );
			serviceFactory.sourcePassword.should.equal( SOURCE_PASSWORD );

			done();
		} );
	} );
	
	describe( 'Creating services', function() {
		var service;

		describe( '#createClientService', function() {
			it( 'should return a ClientService', function( done ) {
				service = serviceFactory.createClientService( USER_NAME, USER_PASSWORD, SITE_ID );
				service.should.be.an.instanceOf( mbo_ClientService );

				done();
			} );
		} );

		describe( '#createClassService', function() {
			it( 'should return a ClassService', function( done ) {
				service = serviceFactory.createClassService( USER_NAME, USER_PASSWORD, SITE_ID );
				service.should.be.an.instanceOf( mbo_ClassService );

				done();
			} );
		} );

		describe( '#createStaffService', function() {
			it( 'should return a StaffService', function( done ) {
				service = serviceFactory.createStaffService( USER_NAME, USER_PASSWORD, SITE_ID );
				service.should.be.an.instanceOf( mbo_StaffService );

				done();
			} );
		} );

		describe( '#createSaleService', function() {
			it( 'should return a SaleService', function( done ) {
				service = serviceFactory.createSaleService( USER_NAME, USER_PASSWORD, SITE_ID );
				service.should.be.an.instanceOf( mbo_SaleService );

				done();
			} );
		} );

		describe( '#createSiteService', function() {
			it( 'should return a SiteService', function( done ) {
				service = serviceFactory.createSiteService( USER_NAME, USER_PASSWORD, SITE_ID );
				service.should.be.an.instanceOf( mbo_SiteService );

				done();
			} );
		} );

	} );

	describe( 'Creating services asynchronously', function() {
		var service,
			prom;

		describe( '#createClientService', function() {
			it( 'should return a Promise that resolves to a ClientService', function( done ) {
				prom = serviceFactory.createClientServiceAsync( USER_NAME, USER_PASSWORD, SITE_ID )
					.then( function( service ) {
						prom.should.be.an.instanceOf( Promise );
						service.should.be.an.instanceOf( mbo_ClientService );

						done();
					} );
			} );
		} );

		describe( '#createClassService', function() {
			it( 'should return a Promise that resolves to a ClassService', function( done ) {
				prom = serviceFactory.createClassServiceAsync( USER_NAME, USER_PASSWORD, SITE_ID )
					.then( function( service ) {
						prom.should.be.an.instanceOf( Promise );
						service.should.be.an.instanceOf( mbo_ClassService );

						done();
					} );
			} );
		} );

		describe( '#createStaffService', function() {
			it( 'should return a Promise that resolves to a StaffService', function( done ) {
				prom = serviceFactory.createStaffServiceAsync( USER_NAME, USER_PASSWORD, SITE_ID )
					.then( function( service ) {
						prom.should.be.an.instanceOf( Promise );
						service.should.be.an.instanceOf( mbo_StaffService );

						done();
					} );
			} );
		} );

		describe( '#createSaleService', function() {
			it( 'should return a Promise that resolves to a SaleService', function( done ) {
				prom = serviceFactory.createSaleServiceAsync( USER_NAME, USER_PASSWORD, SITE_ID )
					.then( function( service ) {
						prom.should.be.an.instanceOf( Promise );
						service.should.be.an.instanceOf( mbo_SaleService );

						done();
					} );
			} );
		} );

		describe( '#createSiteService', function() {
			it( 'should return a Promise that resolves to a SiteService', function( done ) {
				prom = serviceFactory.createSiteServiceAsync( USER_NAME, USER_PASSWORD, SITE_ID )
					.then( function( service ) {
						prom.should.be.an.instanceOf( Promise );
						service.should.be.an.instanceOf( mbo_SiteService );

						done();
					} );
			} );
		} );

	} );
} );