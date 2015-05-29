// 0 : Editor
var wikiloc=null;
if(document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href))
  wikiloc=0;
