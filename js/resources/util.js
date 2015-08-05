/*                  ******** util.js ********                      //
\\ This file has a bunch of misc utility functions.                \\
//                  ******** util.js ********                      */

function Util() {}

module.exports = new Util();

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
	if (int_ == 0)
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
	return (this.floatToChar(vec.x) + this.floatToChar(vec.y))
}

Util.prototype.strToVec = function(str) {
	return {x: this.charToFloat(str[0]), y: this.charToFloat(str[2])}
	// that is not a typo, has to do with how byte characters are concatenated
}

Util.prototype.getAngle = function(vec) {
	return Math.atan2(vec.y, vec.x);
}

Util.prototype.getLength = function(vec) {
	return Math.sqrt(vec.x * vec.x + vec.y * vec.y)
}

Util.prototype.jsonClone = function(o) {
	return JSON.parse(JSON.stringify(o))
}

// https://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
Util.prototype.clone = function(obj) { var copy; if (null == obj || "object" != typeof obj) return obj; if (obj instanceof Date) { copy = new Date(); copy.setTime(obj.getTime()); return copy; } if (obj instanceof Array) { copy = []; for (var i = 0, len = obj.length; i < len; i++) { copy[i] = this.clone(obj[i]); } return copy; } if (obj instanceof Object) { copy = {}; for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]); } return copy; } throw new Error("Unable to copy object."); }

Util.prototype.range = function(start, edge, step) {
	if (arguments.length == 1) {
		edge = start;
		start = 0;
	}
	edge = edge || 0;
	step = step || 1;
	for (var ret = []; (edge - start) * step > 0; start += step) {
		ret.push(start);
	}
	return ret;
}

Util.prototype.findAvailableId = function(xs) {
	y = xs.length
	for (i = 0; i <= xs.length; i++) {
		if (xs[i] != i) {
			y = i; break
		}
	}
	return y
}

Util.prototype.findIndexById = function(elems, id) {
	for (i = 0; i < elems.length; i++) {
		if (elems[i].id == id) 
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
