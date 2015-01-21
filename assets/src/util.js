/**
 * Make a string's first character uppercase
 *
 * @param  {string} str
 * @return {string}
 */
function ucfirst(str) {
	str += '';
	var f = str.charAt(0).toUpperCase();
	return f + str.substr(1);
}

/**
 * Converts a JavaScript object to a format that is suitable for AJAX requests.
 *
 * For example, booleans will be transformed to 1 / 0 values, and dates are
 * converted to UNIX timestamp strings. Objects will be traversed recursively.
 *
 * @param {Object} value
 * @returns The cloned and transformed object
 * @type Object
 */
function toRequestValue(value) {
	if ( value == null )
		return '';

	switch ( typeof(value) ) {
		case 'boolean':
			return ( value ? '1' : '0' );

		case 'object':
			if ( value instanceof Date ) {
				return value.format('%s');
			} else if ( typeOf(value) === 'array' ) {
				value = Array.clone(value);
				for (var i = 0; i < value.length; i++)
					value[i] = toRequestValue(value[i]);
				return value;
			} else {
				value = Object.clone(value);
				for (var i in value) {
					if ( value.hasOwnProperty(i) )
						value[i] = toRequestValue(value[i]);
				}
				return value;
			}

		default:
			return String(value);
	}
}

/**
 * Initializes a conditional parameter. Especially handy when working with requests
 *
 * @param {Object} target The target object (usually the request data object)
 * @param {String} key The key, in case the value could be initalized
 * @param {mixed} value The value
 */
function initParam(target, key, value) {
	if ( value != null )
		target[key] = toRequestValue(value);
}

/**
 * Rounds a decimal value
 * @param {Number} num
 * @returns {Number}
 */
function roundDec(num) {
	return Math.round(num * 100) / 100;
}

/**
 * Parses a decimal number string with base 10
 *
 * @param {String} num
 * @returns {Number}
 */
function parseDec(num) {
	return parseFloat(num, 10);
}

/**
 * Parses an integer string with base 10
 *
 * @param {String} num
 * @returns {Int}
 */
function parseB10(num) {
	return parseInt(num, 10);
}

/**
 * Add a zero "0" at the beginning of a number, in case it's below 10
 *
 * @param {Number} num
 * @returns {String}
 */
function addZero(num) {
	return num < 10 ? ('0' + num) : num;
}

function getParentDir(dir) {
	var s = dir.split('/');
	return s.slice(0, s.length - 1).join('/');
}

function isPicture(ext) {
	return ['jpg', 'jepg', 'gif', 'png'].contains(ext);
}

function formatDate(secs) {
	return new Date(secs * 1000).format('%Y/%m/%d');
}
