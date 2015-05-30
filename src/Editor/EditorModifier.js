var editorModifier=new function(){
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
}();
