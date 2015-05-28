// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://*.namu.wiki/*
// @include     https://*.namu.wiki/*
// @version     3.16
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/FlexiColorPicker.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

function Include(path){
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://raw.githubusercontent.com/LiteHell/NamuFix/dev/src/"+path,
    onload:function(response){
      console.log(response.responseText);
      eval(response.responseText);
    }
  });
}

Include('CheckLocation.js');
