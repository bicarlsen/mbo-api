/* Holds User Credentials for Requests */
function Credentials( username, password, siteIds, type ) {
	this.username = username;
	this.password = password;

	if ( !siteIds ) {
		this.siteIds = [];
	}
	else {
		this.siteIds = [].concat( siteIds );
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

module.exports = Credentials;