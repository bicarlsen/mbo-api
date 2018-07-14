var gulp 		= require( 'gulp' ),
	log 		= require( 'fancy-log' ),
	mocha 		= require( 'gulp-mocha' ),
	istanbul 	= require( 'gulp-istanbul' ), 
	jshint 		= require( 'gulp-jshint' ),
	env 		= require( 'gulp-env' );


/**
 * Lint files
 */
gulp.task( 'lint', function( done ) {
	var lintFiles = [
		'gulpfile.js', 
		'index.js', 
		'lib/*.js',
		'tests/*.js' 
	];

	var lintOptions = {	
		maxlen: 	105,
		quotmark: 	'single',
		loopfunc: 	true
	};

	return gulp.src( lintFiles )
			.pipe( jshint( lintOptions ) )
			.pipe( jshint.reporter( 'jshint-stylish' ) )
			.on( 'finish', function() {
				done();
			} );
} );


gulp.task( 'set-mbo-env', function( done ) {
	process.env.mbo_source_name = 'MBOReports';
	process.env.mbo_source_pass = '2imT8ldj48KsOfXppxppGc0Dk7U=';

	process.env.mbo_user_name = 'Siteowner';
	process.env.mbo_user_pass = 'apitest1234';

	process.env.mbo_site_id = -99;

	done();
} );

/**
 * Test files using Mocha.
 * Test code coverage using Istanbul.
 */
gulp.task( 'run-tests', function( done ) {
	var coverFiles = [
		'lib/**/*.js'
	];

	var testFiles = [
		'tests/*.test.js'
	];

	env.set( { vars: {
		NODE_ENV: 'development'
	} } );

	return gulp.src( coverFiles )
			.pipe( istanbul() )
			.pipe( istanbul.hookRequire() )
			.on( 'finish', function() {
				gulp.src( testFiles ) 
					.pipe( mocha() )
					.pipe( istanbul.writeReports() )
					.pipe( istanbul.enforceThresholds(
						{ thresholds: { global: 0 } }
					) )
					.once( 'end', function() {
						//process.exit();
						done();
					} );
			} );
} );

gulp.task( 'test', gulp.series( 'set-mbo-env', 'run-tests' ) );

/**
 * Watch files
 */

gulp.task( 'watch', function() {
	var watchFiles = [
		'index.js', 
		'tests/*.test.js'
	];

	return new Promise( function( resolve, reject ) {
		gulp.watch( watchFiles, [ 'lint', 'test' ] );

		resolve();
	} );
} );

/**
 * Default task
 * 
 */
gulp.task( 'default', gulp.parallel( 'watch', 'lint', 'test' ) );

/**
 * Make sure Gulp is running.
 * Basic task for debugging.
 */
gulp.task( 'isRunning', function() {
	return new Promise( function( resolve, reject ) {
		log( 'Gulp is running.' );
		return resolve();
	} );
} );