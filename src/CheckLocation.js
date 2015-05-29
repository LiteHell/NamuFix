var isEditing=false;
if(document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href))
isEditing=true;
