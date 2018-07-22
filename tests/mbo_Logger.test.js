var should 		= require( 'should' ),
	sinon 		= require( 'sinon' ),
	log 		= require( 'fancy-log' ),
	fs 			= require( 'fs' ),
	http 		= require( 'http' ),
	mboLogger 	= require( '../logger/mbo_Logger' );

var logger;

var SOURCE_NAME 		= process.env.mbo_source_name,
	SOURCE_PASSWORD 	= process.env.mbo_source_pass,
	USER_NAME 			= process.env.mbo_user_name,
	USER_PASSWORD 		= process.env.mbo_user_pass,
	SITE_ID 			= process.env.mbo_site_id;

describe( 'MBO Logger Unit Tests:', function() {
	describe( '#setService', function() {
		var preName,
			postName;

		before( function( done ) {
			preName 	= 'Service';
			postName 	= 'After'
			logger 		= new mboLogger( 'local', preName );
			done();
		} );

		it( 'should set the Logger service property', function( done ) {
			logger.service.should.equal( preName );
			logger.setService( postName );
			logger.service.should.equal( postName ); 

			done();
		} );
	} );

	describe( 'local logging', function() {
		var service;

		before( function( done ) {
			service = 'Service'
			logger = new mboLogger( 'local', service );
			done();
		} );

		describe( '#setPath', function() {
			it( 'should set the path property to the passed argument', function( done ) {
				logger.setPath( 'path' );
				logger.path.should.equal( 'path' );

				done();
			} );
		} );

		describe( '#setHost', function() {
			it( 'should throw an error', function( done ) {
				( function() { logger.setHost( 'host' ) } ).should.throw( /remote/ );

				done();
			} );
		} );

		describe( '#_createLoggerData', function() {
			var params,
				method,
				result,
				loggerData;

			before( function( done ) {
				params 	= { k1: 'v1', k2: 'v2' };
				method 	= 'method';

				loggerData = {
					service: 	service,
					params: 	params,
					method: 	method
				};

				done();
			} );

			describe( 'without response errors', function() {
				before( function( done ) {
					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 200
					};

					done();
				} );

				it( 'should return a stringified version of the given data', function( done ) {
					var logged = JSON.parse( logger._createLoggerData( params, method, result ) );
					logged.should.eql( loggerData );

					done()
				} );
			} );

			describe( 'with response errors', function() {
				before( function( done ) {
					var res = {
						status: 	'Status',
						errorCode: 	400,
						message: 	'Message'
					};

					loggerData.error = {
						status: 	res.status,
						errorCode: 	res.errorCode,
						message: 	res.message
					};

					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 	res.errorCode,
						Status: 	res.status,
						Message: 	res.message
					};

					done();
				} );

				it( 'should return a stringified version of the given data', function( done ) {
					var logged = JSON.parse( logger._createLoggerData( params, method, result ) );
					logged.should.eql( loggerData );

					done()
				} );
			} );
		} );

		describe( '#_logLocal', function() {
			var path,
				params,
				method,
				result,
				isoPattern,
				loggerData;

			before( function( done ) {
				path = './tests/tmp/test-log.txt';
				logger.setPath( path );

				params 	= { k1: 'v1', k2: 'v2' };
				method 	= 'method';

				loggerData = {
					service: 	service,
					params: 	params,
					method: 	method
				};

				isoPattern = /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;

				done();
			} );

			describe( 'without response errors', function() {
				before( function( done ) {
					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 200
					};

					done();
				} );

				it( 'should write the given information to the path file', function( done ) {
					logger._logLocal( params, method, result );

					fs.readFile( path, 'utf-8', function( err, data ) {
						if ( err ) {
							should.fail( err, JSON.stringify( loggerData ), 'Error reading file ' + path + '.' );
							return done();
						}

						var lines = data.trim().split( '\n' );
						var lastLine = lines.slice( -1 )[ 0 ];

						lastLine.should.match( isoPattern );
						JSON.parse( lastLine.replace( isoPattern, '' ) ).should.eql( loggerData );

						done();
					} );

				} );
			} );

			describe( 'with response errors', function() {
				before( function( done ) {
					var errorCode 	= 400,
						status 		= 'Status',
						message 	= 'Message';

					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 	errorCode,
						Status: 	status,
						Message: 	message
					};

					loggerData.error = {
						errorCode: 	errorCode,
						status: 	status,
						message: 	message 
					};

					done();
				} );

				it( 'should write the given information to the path file', function( done ) {
					logger._logLocal( params, method, result );

					fs.readFile( path, 'utf-8', function( err, data ) {
						if ( err ) {
							should.fail( err, JSON.stringify( loggerData ), 'Error reading file ' + path + '.' );
							return done();
						}

						var lines = data.trim().split( '\n' );
						var lastLine = lines.slice( -1 )[ 0 ];

						lastLine.should.match( isoPattern );
						JSON.parse( lastLine.replace( isoPattern, '' ) ).should.eql( loggerData );

						done();
					} );

				} );
			} );
		} ); // end #_logLocal

		describe( '#log', function() {
			var logStub;

			before( function( done ) {
				logStub = sinon.stub( logger, '_logLocal' );
				done();
			} );

			after( function( done ) {
				logStub.restore();
				done();
			} );

			it( 'should call #_logLocal', function( done ) {
				logger.log();

				logStub.calledOnce.should.be.true;
				done();
			} );
		} );

	} );

	describe( 'remote logging', function() {
		var host,
			path,
			port,
			service,
			params,
			method,
			result,
			isoPattern,
			loggerData;

		before( function( done ) {
			service = 'Service';
			logger = new mboLogger( 'remote', service );

			host = 'localhost';
			path = '/logger';
			port = 7895;
			
			done();
		} );

		describe( '#setPath', function() {
			it( 'should set the path property to the passed argument', function( done ) {
				logger.setPath( path );
				logger.path.should.equal( path );

				done();
			} );
		} );

		describe( '#setHost', function() {
			it( 'should set the host and port', function( done ) {
				logger.setHost( host, port );
				logger.host.should.equal( host );
				logger.port.should.equal( port );

				done();
			} );
		} );

		describe( '#_logRemote', function() {
			before( function( done ) {
				path = '/logger';
				logger.setHost( host, port );
				logger.setPath( path );

				params 	= { k1: 'v1', k2: 'v2' };
				method 	= 'method';

				loggerData = {
					service: 	service,
					params: 	params,
					method: 	method
				};

				isoPattern = /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;

				done();
			} );

			beforeEach( function( done ) {
				server = http.createServer();
				server.listen( port );

				done();
			} );

			afterEach( function( done ) {
				server.close( function() {
					done();
				} );
			} );

			describe( 'without response errors', function() {
				before( function( done ) {
					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 200
					};

					done();
				} );

				it( 'should post the data to the given host, port, and path', function( done ) {
					var listener = function( request, response ) {
						var data = [];
						request.on( 'data', function( chunk ) {
							data.push( chunk );
						} );

						request.on( 'end', function() {
							data = JSON.parse( Buffer.concat( data ).toString() );
							
							data.should.eql( loggerData );

							response.end();
							done();
						} );
					};
					server.on( 'request', listener );

					logger.setHost( host, port );
					logger.setPath( path );
					logger._logRemote( params, method, result );
				} );
			} );

			describe( 'with response errors', function() {
				before( function( done ) {
					var errorCode 	= 400,
						status 		= 'Status',
						message 	= 'Message';

					result = {};
					result[ method + 'Result' ] = {
						ErrorCode: 	errorCode,
						Status: 	status,
						Message: 	message
					};

					loggerData.error = {
						errorCode: 	errorCode,
						status: 	status,
						message: 	message 
					};

					done();
				} );

				it( 'should post the data to the given host, port, and path', function( done ) {
					var listener = function( request, response ) {
						var data = [];
						request.on( 'data', function( chunk ) {
							data.push( chunk );
						} );

						request.on( 'end', function() {
							data = JSON.parse( Buffer.concat( data ).toString() );
							
							data.should.eql( loggerData );

							response.end();
							done();
						} );
					};
					server.on( 'request', listener );

					logger.setHost( host, port );
					logger.setPath( path );
					logger._logRemote( params, method, result );
				} );

			} );
		} ); // end #_logRemote

		describe( '#log', function() {
			var logStub;

			before( function( done ) {
				logStub = sinon.stub( logger, '_logRemote' );
				done();
			} );

			after( function( done ) {
				logStub.restore();
				done();
			} );

			it( 'should call #_logRemote', function( done ) {
				logger.log();

				logStub.calledOnce.should.be.true;
				done();
			} );
		} );

	} );
} );