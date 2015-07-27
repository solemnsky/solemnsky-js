(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
nameFromKeyCode = require('../resources/keys.js')
Util = require('../resources/util.js')

console.log(nameFromKeyCode(171))
console.log(Util.getAngle({x: 1, y: 0}))

},{"../resources/keys.js":2,"../resources/util.js":3}],2:[function(require,module,exports){
var keyboardMap = ["","","","cancel","","","help","","back_space","tab","","","clear","enter","return","","shift","control","alt","pause","caps_lock","kana","eisu","junja","final","hanja","","escape","convert","nonconvert","accept","modechange","space","page_up","page_down","end","home","left","up","right","down","select","print","execute","printscreen","insert","delete","","0","1","2","3","4","5","6","7","8","9","colon","semicolon","less_than","equals","greater_than","question_mark","at","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","win","","context_menu","","sleep","numpad0","numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9","multiply","add","separator","subtract","decimal","divide","f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","f13","f14","f15","f16","f17","f18","f19","f20","f21","f22","f23","f24","","","","","","","","","num_lock","scroll_lock","win_oem_fj_jisho","win_oem_fj_masshou","win_oem_fj_touroku","win_oem_fj_loya","win_oem_fj_roya","","","","","","","","","","circumflex","exclamation","double_quote","hash","dollar","percent","ampersand","underscore","open_paren","close_paren","asterisk","plus","pipe","hyphen_minus","open_curly_bracket","close_curly_bracket","tilde","","","","","volume_mute","volume_down","volume_up","","","semicolon","equals","comma","minus","period","slash","back_quote","","","","","","","","","","","","","","","","","","","","","","","","","","","open_bracket","back_slash","close_bracket","quote","","meta","altgr","","win_ico_help","win_ico_00","","win_ico_clear","","","win_oem_reset","win_oem_jump","win_oem_pa1","win_oem_pa2","win_oem_pa3","win_oem_wsctrl","win_oem_cusel","win_oem_attn","win_oem_finish","win_oem_copy","win_oem_auto","win_oem_enlw","win_oem_backtab","attn","crsel","exsel","ereof","play","zoom","","pa1","win_oem_clear",""];

nameFromKeyCode = function(keycode) {
	return keyboardMap[keycode]
}

module.exports = nameFromKeyCode

},{}],3:[function(require,module,exports){
/*                  ******** util.js ********                      //
\\ This file has a bunch of misc utility functions.                \\
//                  ******** util.js ********                      */

/**** {{{ utils ****/
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
/**** }}} utils ****/

},{}]},{},[1]);
