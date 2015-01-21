$LANG = {};

/**
 * Returns localized text for the specified identifier.
 *
 * @param {String} name The locale string identifier.
 * @param {Object} parameters Optional. The parameters to insert into the
 *     localized string. Default is null.
 * @returns Returns the localized string or the upper-cased identifier
 *     prepended by a "%". Returns null if the identifier cannot be resolved.
 * @type String|null
 */
function _T(name, parameters) {
	var d = $LANG;
	if ( d == null )
		return null;

	var parts = name.split('.');
	for (var i = 0; i < parts.length; i++) {
		d = d[parts[i]];
		if ( d == null )
			return null;
	}

	if ( parameters )
		return String(d).substitute(parameters);
	else
		return d;
}

/**
 * Returns localized text for the specified identifier.
 *
 * @param {String} name The locale string identifier.
 * @param {Object} parameters Optional. The parameters to insert into the
 *     localized string. Default is null.
 * @returns Returns the localized string or the upper-cased identifier
 *     prepended by a "%". Returns null if the identifier cannot be resolved.
 * @type String|null
 */
function _(name, parameters) {
	if ( parameters ) {
		parameters = Object.clone(parameters);
		for (var i in parameters) {
			if ( parameters.hasOwnProperty(i) )
				parameters[i] = String(parameters[i]).htmlSpecialChars();
		}
	}

	return _T(name, parameters);
}
