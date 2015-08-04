/*                  ******** keys.js ********                      //
\\ Defines a function that translates key codes into names.        \\
//                  ******** keys.js ********                      */
var keyboardMap = ["","","","cancel","","","help","","back_space","tab","","","clear","enter","return","","shift","control","alt","pause","caps_lock","kana","eisu","junja","final","hanja","","escape","convert","nonconvert","accept","modechange","space","page_up","page_down","end","home","left","up","right","down","select","print","execute","printscreen","insert","delete","","0","1","2","3","4","5","6","7","8","9","colon","semicolon","less_than","equals","greater_than","question_mark","at","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","win","","context_menu","","sleep","numpad0","numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9","multiply","add","separator","subtract","decimal","divide","f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","f13","f14","f15","f16","f17","f18","f19","f20","f21","f22","f23","f24","","","","","","","","","num_lock","scroll_lock","win_oem_fj_jisho","win_oem_fj_masshou","win_oem_fj_touroku","win_oem_fj_loya","win_oem_fj_roya","","","","","","","","","","circumflex","exclamation","double_quote","hash","dollar","percent","ampersand","underscore","open_paren","close_paren","asterisk","plus","pipe","hyphen_minus","open_curly_bracket","close_curly_bracket","tilde","","","","","volume_mute","volume_down","volume_up","","","semicolon","equals","comma","minus","period","slash","back_quote","","","","","","","","","","","","","","","","","","","","","","","","","","","open_bracket","back_slash","close_bracket","quote","","meta","altgr","","win_ico_help","win_ico_00","","win_ico_clear","","","win_oem_reset","win_oem_jump","win_oem_pa1","win_oem_pa2","win_oem_pa3","win_oem_wsctrl","win_oem_cusel","win_oem_attn","win_oem_finish","win_oem_copy","win_oem_auto","win_oem_enlw","win_oem_backtab","attn","crsel","exsel","ereof","play","zoom","","pa1","win_oem_clear",""];

exports.nameFromKeyCode = function(keycode) {
	return keyboardMap[keycode]
}

exports.keyCodeFromName = function(name) {
	return keyboardMap.indexOf(name)
}
