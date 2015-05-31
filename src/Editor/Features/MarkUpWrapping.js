function WrapClorsure (l,r_){
  return function(){WikiText.ToogleWrapSelected(l,r_);};
}
function ifEmpty(o,c){
  if(typeof o === "undefined") return c;
  if(o == null) return c;
  if(o == '') return c;
  return o;
}
function fontSizeMarkUp(a){
  return function(){
    var pattern=/{{{\+([0-9]+) (.+?)}}}/;
    var sel = WikiText.getSelected();
    if(pattern.test(sel)){
      var currentsize=pattern.exec(sel)[1];
      var content=pattern.exec(sel)[2];
      var newsize=Number(currentsize)+a;
      if(newsize < 1) newsize = 1;
      if(newsize > 5) newsize = 5;
      WikiText.replaceSelected('{{{+'+newsize+' '+ifEmpty(content,'내용')+'}}}')
    }else{
      WikiText.replaceSelected('{{{+1 '+ifEmpty(sel,'내용')+'}}}')
    }
  }
}
editorModifier.addButton('<strong>가</strong>','굵게',WrapClorsure("'''"));
editorModifier.addButton('<i>가</i>','기울게',WrapClorsure("''"));
editorModifier.addButton('<del>가</del>','취소선',WrapClorsure("--"));
editorModifier.addButton('<u>가</u>','밑줄',WrapClorsure("__"));
editorModifier.addButton('가<sub>가</sub>','아랫첨자',WrapClorsure(",,"));
editorModifier.addButton('가<sup>가</sup>','윗첨자',WrapClorsure("^^"));
editorModifier.addButton('<span style="font-size:75%;">가</span>','글씨 작게',fontSizeMarkUp(-1));
editorModifier.addButton('<span style="font-size:125%;">가</span>','글씨 크게',fontSizeMarkUp(1));
