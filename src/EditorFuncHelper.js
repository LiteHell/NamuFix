var Textarea=document.querySelector("textarea[name=content]");
function isSomethingSelected(){
  return Textarea.selectionStart!=Textarea.selectionEnd;
}
function getSelected(){
  return Textarea.value.substring(Textarea.selectionStart,Textarea.selectionEnd);
};
