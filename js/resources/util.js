/*									******** util.js ********											 //
\\ This file has a bunch of misc utility functions.								 \\
//									******** util.js ********											 */

function Util() {}

module.exports = new Util(); 
exports = module.exports

/**** {{{ byte magic ****/
Util.prototype.intToFloat = function(int_) {
	var buffer = new ArrayBuffer(4);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	intView[0] = int_;
	return floatView[0];
}

Util.prototype.floatToInt = function(float_) {
	var buffer = new ArrayBuffer(4);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	floatView[0] = float_;
	return intView[0];
}

Util.prototype.intToChar = function(int_) {
	//Because bitwise arithmetic doesn't go below 0
	if (int_ === 0)
		return '\0\0';

	//If it's negative, we need to do 2s comp on it so we can make it positive.
	// If it's negative, then int_ >> 16 will give something like -1 (still negative)
	// because >> doesn't shift the sign bit.
	var neg = false;
	if (int_ < 0) {
		//2s comp
		int_ = (-int_ ^ 0x7FFFFFFF) + 1;
		neg = true;
	}

	//Split it up into parts
	var lower = int_ & 0xFFFF;
	var higher = int_ >> 16;
	//If it was negative, we lost the sign bit. Add it back
	if (neg) higher ^= 0x8000;
	//Combine them
	return String.fromCharCode(higher) + String.fromCharCode(lower);
}

Util.prototype.charToInt = function(char_) {
	var higher = char_.charCodeAt(0);
	var lower = char_.charCodeAt(1);
	//2s comp done by << 16 for us, if it was negative
	return higher << 16 | lower;
}

Util.prototype.floatToChar = function(float_) {
	return this.intToChar(this.floatToInt(float_));
}

Util.prototype.charToFloat = function(char_) {
	return this.intToFloat(this.charToInt(char_));
}

Util.prototype.vecToStr = function(vec) {
	return this.floatToChar(vec.x) + this.floatToChar(vec.y)
}

Util.prototype.strToVec = function(str) {
	return {x: this.charToFloat(str[0]), y: this.charToFloat(str[2])}
	// that is not a typo, has to do with how byte characters are concatenated
}
/**** }}} byte magic ****/

/**** {{{ deflation pairs ****/
Util.prototype.noDeflation =
	{ deflate: function(x){return x}
	, inflate: function(x){return x} }

Util.prototype.boolDeflation =
	{ deflate: function(bool) { return bool ? 1 : 0 }
	, inflate: function(val) { return val === 1 } }

Util.prototype.floatDeflation =
	{ deflate: function(f) { return exports.floatToChar(f) }
	, inflate: function(val) { return exports.charToFloat(val) } }

Util.prototype.vecDeflation = 
	{ deflate: 
			function(x) {
				return {
					x: exports.floatDeflation.deflate(x.x)
					, y: exports.floatDeflation.deflate(x.y)
				}
			}
	, inflate: 
			function(x){
				return {
					x: exports.floatDeflation.inflate(x.x)
					, y: exports.floatDeflation.inflate(x.y)
				}
			} 
	}

Util.prototype.movementDeflation = 
	{ deflate:
			function(movement) {
				return "" + (movement.left ? 1 : 0) + (movement.right ? 1 : 0)
					+ (movement.forward ? 1 : 0) + (movement.backward ? 1 : 0)
			}
	, inflate:
			function(val) {
				return {left: val[0] === 1, right: val[1] === 1
					, forward: val[2] === 1, backward: val[3] === 1}
			}
	}
/**** }}} deflation pairs ****/

/**** {{{ serialising objects ****/ 
function deflatePair(deflationRules, pair) {
	var matches = deflationRules.filter(
		function(rule) { return rule.key === pair.key	} 
	, pair)
	if (matches.length > 0) {
		var rule = matches[0]
		return {
			key: rule.shortKey
			, value: rule.deflation.deflate(pair.value)
		}
	} 
	return pair 
}

function inflatePair(deflationRules, pair) {
	var matches = deflationRules.filter(
		function(rule) { return rule.shortKey === pair.key	} 
		, pair)
	if (matches.length > 0) {
		var rule = matches[0]
		return {
			key: rule.key
			, value: rule.deflation.inflate(pair.value)
		}
	} 
	return pair 
}

Util.prototype.deflateObject = function(deflationRules, object) {
	var result = []
	
	object.forEach(
		function(inflated) {
			var deflated = {}
			Object.keys(inflated).forEach(
				function(key) {
					var pair = deflatePair(deflationRules, {key: key, value: inflated[key]})
					deflated[pair.key] = pair.value	
				}
			, deflated)
			result.push(deflated)
		}
	, result)

	return result
}

Util.prototype.inflateObject = function(deflationRules, object) {
	var result = []

	object.forEach(
		function(deflated) {
			var inflated = {}
			Object.keys(deflated).forEach(
				function(key) {
					var pair = inflatePair(deflationRules, {key: key, value: deflated[key]})
					inflated[pair.key] = pair.value
				}
			)
			result.push(inflated)
		}
	, result)
	
	return result
}
/**** }}} serialising objects ****/ 

/**** {{{ vector math ****/
Util.prototype.getAngle = function(vec) {
	return Math.atan2(vec.y, vec.x);
}

Util.prototype.getLength = function(vec) {
	return Math.sqrt(vec.x * vec.x + vec.y * vec.y)
}
/**** }}} vector math ****/

/**** {{{ the absurd problem of cloning ****/
Util.prototype.jsonClone = function(o) {
	return JSON.parse(JSON.stringify(o))
}

// https://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
Util.prototype.clone = function(obj) { var copy; if (null === obj || "object" != typeof obj) return obj; if (obj instanceof Date) { copy = new Date(); copy.setTime(obj.getTime()); return copy; } if (obj instanceof Array) { copy = []; for (var i = 0, len = obj.length; i < len; i++) { copy[i] = this.clone(obj[i]); } return copy; } if (obj instanceof Object) { copy = {}; for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]); } return copy; } throw new Error("Unable to copy object."); }
/**** }}} the absurd problem of cloning ****/

/**** {{{ utility ****/
Util.prototype.range = function(start, edge, step) {
	if (arguments.length === 1) {
		edge = start;
		start = 0;
	}
	edge = edge || 0;
	step = step || 1;
	var ret 
	for (ret = []; (edge - start) * step > 0; start += step) {
		ret.push(start);
	}
	return ret;
}
/**** }}} utility ****/

/**** {{{ elem id operations ****/
Util.prototype.findAvailableId = function(xs) {
	var y = xs.length
	for (var i = 0; i <= xs.length; i++) {
		if (xs[i] !== i) {
			y = i; break
		}
	}
	return y
}

Util.prototype.findIndexById = function(elems, id) {
	for (var i = 0; i < elems.length; i++) {
		if (elems[i].id === id) 
			return i
	}	
	return null
}

Util.prototype.findElemById = function(elems, id) {
	var index = this.findIndexById(elems, id)
	if (index === null)
		return null
	return elems[index]
}

Util.prototype.removeElemById = function(elems, id) {
	var index = this.findIndexById(elems, id)
	if (index === null)
		return null
	elems.splice(index, 1)
}

Util.prototype.getQueryStringValue = function(key) {
	//http://stackoverflow.com/a/9870540/214063
	return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

/**** }}} elem id operations ****/
