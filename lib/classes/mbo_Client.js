/* Represents an MBO Client */
module.exports = mbo_Client

function mbo_Client( id, options ) {
	this.id = id
	
	// copy options into profile
	for ( var field in options ) {
		this[ field ] = options[ field ]
	}
}