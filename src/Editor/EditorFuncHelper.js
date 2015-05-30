var WikiText= new (function(){
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
    var p=this.getSelected();
    if(p.indexOf(l)!=0||p.indexOf(r)!=p.length-r.length);
      p=l+p+r;
    else
      p=p.substring(l.length,p.length-r.length)
    this.replaceSelected(p);
  }
})();
