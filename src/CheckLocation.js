function IsEditing(){
  document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href);
  }
