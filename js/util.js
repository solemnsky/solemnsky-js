function Util() {}

if (typeof module !== "undefined") {
	module.exports = new Util();
} else {
	Utils = new Util();
}

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
