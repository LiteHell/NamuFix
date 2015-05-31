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
  url: 'https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/NamuFixInterface.css',
  method: 'GET',
  onload: function(response) {
    GM_addStyle(response.responseText);
  }
});
//NF Setting Btn
function NF_Setting(){
	var nfbtn = document.createElement("div");
	nfbtn.id = "nf_set";
	nfbtn.innerHTML = "<a><li><span style=\"color: rgb(255, 255, 255); font-size: 20pt; margin-left: 10px\" class=\"ion-ios-gear\"></span></li></a>";
	//click evt
	nfbtn.onclick = function(){
	var window = document.createElement("div");
	window.id = "nf-set";
	window.innerHTML = "<div id=\"nf-title\"> 설정 <a href=\"#close\" id=\"close\">X</a> </div>"
	document.body.appendChild(window);
	}
	//btn create
	document.body.appendChild(nfbtn);
}
// Included : src/CheckLocation.js
function IsEditing() {
  return document.querySelector("textarea[name=content]") !== null && (/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href);
}
function Iswikipage() {
  return (/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href)==true;
}

if (IsEditing()) {
  // Included : src/Editor/EditorModifier.js
  var editorModifier = new function() {
    var hiddenFileInput = document.createElement('input');
    hiddenFileInput.setAttribute('type', 'file');
    hiddenFileInput.style.visibility = 'hidden';
    hiddenFileInput.id = "namufix_hiddenfileinput";
    document.body.appendChild(hiddenFileInput);

    var txtarea = document.querySelector("textarea[name=content]");
    var buttonsBar = document.createElement("div");
    var editorStatus = document.createElement("div");

    buttonsBar.id = "EditInterfaceButtons";
    editorStatus.id = "EditInterfaceStatus";

    txtarea.parentNode.insertBefore(buttonsBar, txtarea);
    txtarea.parentNode.insertBefore(editorStatus, txtarea);

    this.addButton = function(labelHtml, alt, func) {
      var button = document.createElement("button");
      button.setAttribute("type", "button");
      button.className = "BetterNamuButton";
      button.title = alt;
      button.setAttribute("alt", alt);
      button.innerHTML = labelHtml;
      button.addEventListener("click", func);
      buttonsBar.appendChild(button);
    };
    this.addSpace = function() {
      var vline = document.createElement("vr");
      buttonsBar.appendChild(vline);
    }
    this.setStatus = function(txt) {
      editorStatus.innerHTML = txt;
    }
  }();

  // Included : src/Editor/EditorFuncHelper.js
  var WikiText = new function() {
    this.docTitle = document.querySelector('h1.title > a').innerHTML;
    this.docSectionNo = document.querySelector("#editForm > input[name=section]").value;

    var txtarea = document.querySelector('txtarea[name=content]');
    this.isSomethingSelected = function() {
      return txtarea.selectionStart != txtarea.selectionEnd;
    }
    this.getSelected = function() {
      var r = txtarea.value;
      var s = txtarea.selectionStart;
      var e = txtarea.selectionEnd;
      return r.substring(s, e);
    }
    this.replaceSelected = function(str) {
      var r = txtarea.value;
      var s = txtarea.selectionStart;
      var e = txtarea.selectionEnd;
      txtarea.value = r.substring(0, s) + str + r.substring(e);
      txtarea.focus();
      txtarea.selectionStart = s;
      txtarea.selectionEnd = s + str.length;
    }
    this.ToggleWrapSelected = function(l, r_) {
      if (typeof r === "undefined") {
        var r = l;
      } else {
        var r = r_;
      }
      var p = this.getSelected();
      if (p.indexOf(l) != 0 || p.indexOf(r) != (p.length - r.length)) {
        p = l + p + r;
      } else {
        p = p.substring(l.length, p.length - r.length)
      }
      this.replaceSelected(p);
    }

  }();

  // Included : src/Editor/EditorFeatures.js
  // Included : src/Editor/Features/MarkUpWrapping.js
  function WrapClosure(l, r_) {
    if (typeof r_ === "undefined") {
      return function() {
        WikiText.ToogleWrapSelected(l);
      };
    } else {
      return function() {
        WikiText.ToogleWrapSelected(l, r_);
      };
    }
  }

  function ifEmpty(o, c) {
    if (typeof o === "undefined") return c;
    if (o == null) return c;
    if (o == '') return c;
    return o;
  }

  function fontSizeMarkUp(a) {
    return function() {
      var pattern = /{{{\+([0-9]+) (.+?)}}}/;
      var sel = WikiText.getSelected();
      if (pattern.test(sel)) {
        var currentsize = pattern.exec(sel)[1];
        var content = pattern.exec(sel)[2];
        var newsize = Number(currentsize) + a;
        if (newsize < 1) newsize = 1;
        if (newsize > 5) newsize = 5;
        WikiText.replaceSelected('{{{+' + newsize + ' ' + ifEmpty(content, '내용') + '}}}')
      } else {
        WikiText.replaceSelected('{{{+1 ' + ifEmpty(sel, '내용') + '}}}')
      }
    }
  }
  editorModifier.addButton('<strong>가</strong>', '굵게', WrapClosure("'''"));
  editorModifier.addButton('<i>가</i>', '기울게', WrapClosure("''"));
  editorModifier.addButton('<del>가</del>', '취소선', WrapClosure("--"));
  editorModifier.addButton('<u>가</u>', '밑줄', WrapClosure("__"));
  editorModifier.addButton('가<sub>가</sub>', '아랫첨자', WrapClosure(",,"));
  editorModifier.addButton('가<sup>가</sup>', '윗첨자', WrapClosure("^^"));
  editorModifier.addButton('<span style="font-size:75%;">가</span>', '글씨 작게', fontSizeMarkUp(-1));
  editorModifier.addButton('<span style="font-size:125%;">가</span>', '글씨 크게', fontSizeMarkUp(1));
}

