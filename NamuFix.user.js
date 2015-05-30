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
})

// 0 : Editor
var wikiloc=null;
if(document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href))
  wikiloc=0;

if(wikiloc==0){

  var editorModifier=new function(){
  this.docTitle=document.querySelector('h1.title > a').innerHTML;
  this.docSectionNo=document.querySelector("#editForm > input[name=section]").value;

  var hiddenFileInput=document.createElement('input');
  hiddenFileInput.setAttribute('type','file');
  hiddenFileInput.style.visibility='hidden';
  hiddenFileInput.id="namufix_hiddenfileinput";
  document.body.appendChild(hiddenFileInput);

  var txtarea=document.querySelector("textarea[name=content]");
  var buttonsBar=document.createElement("div");
  var editorStatus=document.createElement("div");

  buttonsBar.id="EditInterfaceButtons";
  editorStatus.id="EditInterfaceStatus";

  txtarea.parentNode.insertBefore(buttonsBar,txtarea);
  txtarea.parentNode.insertBefore(editorStatus,txtarea);

  this.addButton=function(labelHtml,alt,func){
    var button=document.createElement("button");
    button.clssName="BetterNamuButton";
    button.title=alt;
    button.setAttribute("alt",alt);
    button.innerHTML=labelHtml;
    button.addEventListener("click",func);
    buttonsBar.appendChild(button);
  };
  this.addSpace=function(){
    var vline=document.createElement("vr");
    buttonsBar.appendChild(vline);
  }
  this.setStatus=function(txt){
    editorStatus.innerHTML=txt;
  }
}

  var WikiText= new function(){
  var txtarea=document.querySelector('txtarea[name=content]');
  this.isSomethingSelected=function(){
    return txtarea.selectionStart!=txtarea.selectionEnd;
  }
  this.getSelected=function(){
    var r=txtarea.value;
    var s=txtarea.selectionStart;
    var e=txtarea.selectionEnd;
    return r.substring(s,e);
  }
  this.replaceSelected=function(str){
    var r=txtarea.value;
    var s=txtarea.selectionStart;
    var e=txtarea.selectionEnd;
    txtarea.value=txtarea.substring(0,s)+str+txtarea.substring(e);
    txtarea.focus();
    txtarea.selectionStart=s;
    txtarea.selectionEnd=s+str.length;
  }
  this.WrapSelectedWith=function(l,r){
    if(typeof r === "undefined") var r=l;
    var p=getSelected();
    if(p.indexOf(l)!=0||p.indexOf(r)!=p.length-r.length);
      p=l+p+r;
    else
      p=p.substring(l.length,p.length-r.length)
    replaceSelected(p);
  }
};

  
}
