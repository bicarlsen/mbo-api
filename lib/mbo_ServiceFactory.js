var mbo_ClientService = require( './services/mbo_ClientService' );

module.exports.setSourceCredentials = function( username, password ) {
	this.sourceName = username;
	this.sourcePassword = password;
};
 
module.exports.createClientService = function( username, password, siteIds ) {
	if ( !( this.sourceName && this.sourcePassword ) ) {
		throw new Error( 'Source credentials have not been set.' );
	}

	var clientService = new mbo_ClientService( this.sourceName, this.sourcePassword )
	clientService.on( 'initialized', function() {
		clientService.setUserCredentials( username, password, siteIds );
		clientService.emit( 'ready' );
	} );

	return clientService;
};