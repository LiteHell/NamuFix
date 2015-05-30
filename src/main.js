// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://*.namu.wiki/*
// @include     https://*.namu.wiki/*
// @version     3.17
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/FlexiColorPicker.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

GM_xmlhttpRequest({
  url:'https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/NamuFixInterface.css',
  method:'GET',
  onload:function(response){
    GM_addStyle(response.responseText);
  }
});

/** Include("src/CheckLocation.js") **/
if(IsEditing()){

  /** Include("src/Editor/EditorModifier.js") **/
  /** Include("src/Editor/EditorFuncHelper.js") **/
  /** Include("src/Editor/EditorFeatures.js") **/
}
