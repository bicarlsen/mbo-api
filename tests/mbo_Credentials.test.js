var Credentials	= require( '../lib/classes/mbo_Credentials' ),
	should 		= require( 'should' ),
	log 		= require( 'fancy-log' );


describe( 'MBO Credentials Unit Tests:', function() {
	var creds;

	describe( 'Constructor', function() {

		describe( 'Source credenitals', function() {
			var username,
			password,
			apiKey,
			siteIds,
			type;

			before( function( done ) {
				username 	= 'user';
				password 	= 'pass';
				apikey 		= 'key';
				siteIds 	= -99;
				type 		= 'source';

				done();
			} );

			describe( 'Using SourceName and Password (for API versions less than 6.0)', function() {
				before( function( done ) {
					creds = new Credentials( 
						{ 
							username: username, 
							password: password 
						},

						siteIds, 
						type 
					);

					done();
				} );

				it( 'should have the proper credentials', function( done ) {
					creds.credentials.sourceCredentials.should.eql( {
						username: username, 
						password: password 
					} );

					done();
				} );

				it( 'should have the correct authentication methods', function( done ) {
					creds.authentication.should.eql( {
						sourceCredentials: true,
						apiKey: false
					} );

					done();
				} );

			} );

			describe( 'Using API key (for API versions starting at 6.0)', function() {
				before( function( done ) {
					creds = new Credentials(
						{ apiKey: apikey },

						siteIds,
						type
					);

					done();
				} );

				it( 'should have the proper credentials', function( done ) {
					creds.credentials.apiKey.should.eql( apikey );

					done();
				} );

				it( 'should have the correct authentication methods', function( done ) {
					creds.authentication.should.eql( {
						sourceCredentials: false,
						apiKey: true
					} );

					done();
				} );

			} );
		} ); // end Source Credentials

		describe( 'User credentials', function() {
			var username,
				password,
				type;

			before( function( done ) {
				username 	= 'user';
				password 	= 'pass';
				type 		= 'user';

				done();
			} );

		} ); // end User Credentials

		describe( 'Invalid credentials', function() {

		} ); // end Invalid Credentials
	} );
} );