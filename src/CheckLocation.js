function IsEditing(){
  return document.querySelector("textarea[name=content]")!==null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href);
}
function IsWikipage() {
  return (/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href)==true;
}
