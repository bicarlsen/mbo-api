var	EventEmitter = require( 'events' ).EventEmitter,
	soap = require( 'soap' ),
	Promise = require( 'bluebird' );

var Credentials = require( '../classes/mbo_Credentials' );

Promise.promisifyAll( soap );

function mbo_Service( service, sourceName, sourcePassword ) {
	this.emitter = new EventEmitter();

	this.sourceCredentials = new Credentials( sourceName, sourcePassword, [], 'source' );
	this.userCredentials = undefined;

	// Request Defaults
	this.requestDefaults = {
		XMLDetail: 'Full',
		PageSize: '1000' 
	};

	// Setup SOAP Client 
	var self = this;
	soap.createClientAsync( 'https://api.mindbodyonline.com/0_5/' + service + '.asmx?wsdl' ).
		then( function( client ) {
			Promise.promisifyAll( client );
			self.service = client;

			// Add Service Functions to the Class
			var description = client.describe(); 
			for ( var service in description ) { 
				for ( var port in description[ service ] ) {
					for ( var fcn in description[ service ][ port ] ) { 
						self[ fcn ] = self._defineMethod( fcn );
					}
				}
			}

			self.emit( 'initialized' );
		} )
		.catch( function( err ) {
			throw err;
		} ); 
}

/* Sets the User Credentials */
mbo_Service.prototype.setUserCredentials = function( username, password, siteIds ) {
	this.userCredentials = new Credentials( username, password );
	this.addSiteIds( siteIds );
};

/* Add Site Ids to Credentials */
mbo_Service.prototype.addSiteIds = function( siteIds ) {
	this.userCredentials.addSiteIds( siteIds );
	this.sourceCredentials.addSiteIds( siteIds ); // Syncs User and Source Site Ids
};

mbo_Service.prototype._defineMethod = function( name ) {
	var self = this;
	return function( args ) {
		var params = {
			Request: {
				SourceCredentials: self.sourceCredentials.toSOAP(),
				UserCredentials: self.userCredentials.toSOAP()
			}
		};

		for ( var dflt in self.requestDefaults ) {
			params.Request[ dflt ] = self.requestDefaults[ dflt ];
		}

		for ( var arg in args ) {
			params.Request[ arg ] = args[ arg ];
		}

		return ( self.service[ name + 'Async' ] )( params );
	};
}

//------------ Event Methods -------------------

mbo_Service.prototype.on = function( event, listener ) {
	this.emitter.on( event, listener );
};

mbo_Service.prototype.emit = function( event ) {
	this.emitter.emit( event );
};

module.exports = mbo_Service;