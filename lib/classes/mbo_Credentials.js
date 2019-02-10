/* Holds User Credentials for Requests */
function Credentials( credentials, siteIds, type = '' ) {
	this.credentials = this._createCredentials( credentials );
	this.siteIds = [];
	
	if ( siteIds ) {
		this.siteIds = this.siteIds.concat( siteIds );
	}

	if ( type.toLowerCase() === 'source' ) {
		this.type = 'source';
	}
	else {
		this.type = 'user';
	}
	
};

/**
 * Defines the computed 'authentication' property
 *
 */
Object.defineProperty( Credentials.prototype, 'authentication', {
	get: function() {
		if( this.type !== 'source' ) {
			// authentication does not appy
			return undefined;
		}

		var auth = { 
			'sourceCredentials': false, 
			'apiKey': false 
		};

		for ( var key in auth ) {
			if ( this.credentials[ key ] ) { 
				// set authentication value to true if key has defined value in credentials
				auth[ key ] = true;
			}
		}

		return auth;
	}
} );


/**
 * Sets the Source Credentials.
 * Sets the Source Credentials to undefined if both parameters are undefined.
 *
 * @param {string} sourcename 	The MINDBODY Sourcename
 * @param {string} password 	The MINDBODY Source Password
 *
 * @throw {Error} Throws an error if only one parameter is undefined.
 */
Credentials.prototype.setSourceCredentials = function( sourcename, password ) {
	if ( sourcename === undefined && password === undefined ) {
		this.credentials.sourceCredentials = undefined;
	}
	else if ( sourcename === undefined || password === undefined ) {
		throw new Error( 'Invalid Source Credentials' );
	}
	else {
		this.credentials.sourceCredentials = {
			username: sourcename,
			password: password
		};
	}
};

/**
 * Sets the API Key
 *
 * @param {string} apiKey The MINDBODY API Key
 *
 */
Credentials.prototype.setApiKey = function( apiKey ) {
	if ( apiKey === undefined ) {
		throw new Error( 'Invalid Source Credentials' );
	}

	this.credentials.apiKey = apiKey;
};

/**
 * Adds sites to the credentials
 *
 * @param {integer|array} A single site id, or array of ids to be added.
 */
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

/**
 * Returns the keys of valid credentials
 *
 * @return {array} Keys of valid credential objects.
 */
Credentials.prototype.validCredentials = function() {
	var creds = [];

	for( var key in this.credentials ) {
		if ( this.credentials[ key ] ) {
			creds.push( key );
		}
	}

	return creds;
};

/**
 * Checks whether any valid credentials are set.
 *
 * @return {boolean} Whether or not valid credentials are set.
 */
Credentials.prototype.hasValidCredentials = function() {
	return !!( this.validCredentials() );
};

Credentials.prototype.toSOAP = function() {
	var soap = {
		Password: this.credentials.password
	};

	if ( this.type === 'source' ) {
		soap.SourceName = this.credentials.username;
	}
	else {
		soap.Username = this.credentials.username;
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

//------ Internal Functions ---------

/**
 * Creates a credentials object for authentication.
 *
 * @param {object} credentials An object containing your MINDBODY developer credentials, included in all service calls.
 *							If has the keys [ 'username', 'password' ] will use SourceCredentials.
 *							If has the keys [ 'apiKey' ] will use the API-key header.
 *
 * @return {object} Returns an object with keys [ 'username', 'password', 'apiKey' ], 
 * 					which are defined based on the passed parameters.
 *
 * @throws {Error} Throws an error if no valid credentials are passed.
 */
 Credentials.prototype._createCredentials = function( credentials ) {
	var creds = { 
		username: 	undefined,
		password: 	undefined,
		apiKey: 	undefined 
	};

	if( credentials.username && credentials.password ) {
		creds.username = credentials.username;
		creds.password = credentials.password;
	}

	if( credentials.apiKey ) {
		creds.apiKey = credentials.apiKey;
	}

	// Throw error if all credentials undefined, no valid credentials
	if( Object.values( creds ).every( c => c === undefined ) ) {
		throw new Error( 'Invalid credentials' );
	}
	
	return creds;
};


//----------- Static Methods -------------------

/**
 * Checks whether credentials are valid or not.
 *
 * @param {object} credentials The credentials object to check
 *
 * @return {boolean} Whether or not any of the credentials are valid
 */
Credentials.validateCredentials = function( credentials ) {
	if( credentials.apiKey ) {
		return true
	}
	else if( credentials.username && credentials.password ) {
		return true;
	}

	return false;
};



module.exports = Credentials;