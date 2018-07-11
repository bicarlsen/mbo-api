/* Holds User Credentials for Requests */
function Credentials( username, password, siteIds, type ) {
	this.username = username;
	this.password = password;
	this.siteIds = [];
	
	if ( siteIds ) {
		this.siteIds = this.siteIds.concat( siteIds );
	}

	if ( type === 'source' ) {
		this.type = 'source';
	}
	else {
		this.type = 'user';
	}
}

Credentials.prototype.addSiteIds = function( ids ) {
	this.siteIds = this.siteIds.concat( ids );

	var uniqueIds = [];
	this.siteIds.forEach( function( id ) {
		if ( uniqueIds.indexOf( id ) === -1 ) {
			uniqueIds.push( id );
		}
	} );

	this.siteIds = uniqueIds;
};

Credentials.prototype.toSOAP = function() {
	var soap = {
		Password: this.password
	};

	if ( this.type === 'source' ) {
		soap.SourceName = this.username;
	}
	else {
		soap.Username = this.username;
	}

	soap.SiteIDs = {
		int: this.siteIds
	};

	return soap;
};

Credentials.prototype.toString = function() {
	return '[object Credentials] {' +
			'type: ' 		+ this.type 		+ ', ' +
			'username: ' 	+ this.username 	+ ', ' +
			'password: ' 	+ this.password 	+ ', ' +
			'siteIds: ' 	+ this.siteIds 		+ '}';
};

module.exports = Credentials;