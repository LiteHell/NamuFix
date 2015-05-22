// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     2.4
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @resource    ColorPickerLib https://raw.githubusercontent.com/LiteHell/NamuFix/master/FlexiColorPicker.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// ==/UserScript==

// 나무마크 도움말 : https://namu.wiki/w/HelpOnEditing?from=%ED%8E%B8%EC%A7%91%20%EB%8F%84%EC%9B%80%EB%A7%90

GM_addStyle('em{font-style: italic;}');
if(document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href)){
  // 수정 인터페이스 개선
  GM_addStyle(GM_xmlhttpRequest({method:"GET",url:"https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFixInterface.css",synchronous:true}).responseText); // http://jsfiddle.net/Vestride/dkr9b/ 참고함
  
  // // 색 선택 라이브러리 삽입
  // var elm=document.createElement("script");
  // elm.innerHTML=GM_getResourceText('ColorPickerLib');
  // document.head.appendChild(elm);
  
  // 숨겨진 파일 input태그 추가 (이미지 업로드에 쓰임)
  var elm=document.createElement("input");
  elm.setAttribute("type","file");
  elm.style.visibility="hidden";
  document.body.appendChild(elm);
  
  var isEmpty=function(v){
    if(typeof v === "undefined") return true;
    if(v==null) return true;
    if(v=='') return true;
    return false;
  }
  var txtarea=document.querySelector("textarea[name=content]");
  var buttons=document.createElement("div");
  var editstatus=document.createElement("div");
  var isSomethingSelected=function(){return txtarea.selectionStart!=txtarea.selectionEnd;}
  var addbutton=function(labelhtml, alt, func){
    var button=document.createElement("button");
    button.setAttribute("type","button");
    button.className="BetterNamuButton";
    button.title=alt;
    button.setAttribute("alt",alt);
    button.innerHTML=labelhtml;
    button.addEventListener("click",func);
    buttons.appendChild(button);
  };
  var addline=function(){
   var vline=document.createElement("vr");
    buttons.appendChild(vline);
  };
  var processSelected=function(func){
    var txt='';
    var s=txtarea.selectionStart, e=txtarea.selectionEnd;
    var willadd=func(txtarea.value.substring(s,e));
    txt+=txtarea.value.substring(0,s);
    txt+=willadd;
    txt+=txtarea.value.substring(e);
    txtarea.value=txt;
    txtarea.focus();
    txtarea.selectionStart=s;
    txtarea.selectionEnd=s+willadd.length;
  };
  var insertText=function(text){
    var txt='';
    txt+=txtarea.value.substring(0,txtarea.selectionStart);
    txt+=text;
    txt+=txtarea.value.substring(txtarea.selectionStart);
    txtarea.value=txt;
  }
  var produceIcoSpan=function(icotxt){ // http://ionicons.com/
    return '<span class="icon '+icotxt+'"></span>'
  };
  var WrapWithMarkUp=function(mk){
    return function(){
     if(isSomethingSelected())
       processSelected(function(txt){return mk+txt+mk});
      else{
        var t=mk+'내용'+mk;
        var s=txtarea.selectionStart;
        insertText(t);
        txtarea.focus();
        txtarea.selectionStart=s+mk.length;
        txtarea.selectionEnd=s+mk.length+2;
      }
    };
  }
  var uploadImage=function(){
      // http://jsfiddle.net/eliseosoto/JHQnk/ 이용
      elm.addEventListener("change",function(evt){
        // imgur Client ID : 60a43baebed658a
        var file=evt.target.files[0];
        if(file){
          var reader = new FileReader();
          reader.onload=function(evt){
            var res=JSON.parse(GM_xmlhttpRequest({
              method: "POST",
              headers:{
                Authorization: "Client-ID 60a43baebed658a",
                Accept: "application/json",
                "Content-Type":"application/x-www-form-urlencoded"
              },
              synchronous:true,
              url:"https://api.imgur.com/3/image",
              data:'type=base64&image='+encodeURIComponent(reader.result.replace(/.*,/,''))
            }).responseText);
            if(!res["success"]){
              editstatus.innerHTML="죄송하지만 이미지 업로드에 실패하였습니다."
            }else{
              insertText(res["data"]["link"]);
              //insertText('\n##삭제는 http://imgur.com/delete/'+res["data"]["deletehash"]+'에 접속하여 할 수 있습니다.\n##삭제 링크 외에 기술적으로 자세한 내용은 API 응답을 참고하세요.\n##\n##주석은 지우셔도 되고 삭제 링크 메모후 주석을 지우시는 것을 권장합니다.\n##\n## API 응답 : '+JSON.stringify(res));
              editstatus.innerHTML='삭제는 <a href="http://imgur.com/delete/'+res["data"]["deletehash"]+'">http://imgur.com/delete/'+res["data"]["deletehash"]+'</a> 에 접속하시여 하실 수 있습니다. 업로드후 한번만 표시되니 지금 메모해두세요.'
            }
          };
          reader.readAsDataURL(file);
        }
      });
      elm.click();
    // imgur Client ID : 60a43baebed658a
  };
  var LimitInt=function(val,min,max){
    if(max<val)return max;
    if(val<min)return min;
    return val;
  }
  var fontsizeMarkUp=function(add){
    return function(){
      var pattern=/{{{\+([0-9]+) (.+?)}}}/;
      processSelected(function(txt){
        if(pattern.test(txt)){
         var currentsize=Number(txt.replace(pattern,'$1'));
         var txtin=txt.replace(pattern,'$2');
         var newsize=currentsize+add;
          return '{{{+'+LimitInt(newsize,1,5)+' '+txtin+'}}}';
        }else{
          return '{{{+'+LimitInt(add,1,5)+' '+(isEmpty(txt)?'내용':txt)+'}}}';
        }
      });
    };
  }
  var colorMarkUp=function(){
    
  }
  buttons.id="EditInterfaceButtons";
  editstatus.id="EditInterfaceStatus";
  // 서식 버튼
  addbutton("<strong>가</strong>","굵게",WrapWithMarkUp("'''"));
  addbutton("<i>가</i>","기울게",WrapWithMarkUp("''"));
  addbutton("<del>가</del>","취소선",WrapWithMarkUp("--"));
  addbutton("<u>가</u>","밑줄",WrapWithMarkUp("__"));
  addbutton("아<sub>Ah</sub>","아랫첨자",WrapWithMarkUp(",,"));
  addbutton("아<sup>Ah</sup>","윗첨자",WrapWithMarkUp("^^"));
  addbutton('<span style="font-size:75%">아</span>',"글씨 작게",fontsizeMarkUp(-1));
  addbutton('<span style="font-size:125%">아</span>',"글씨 크게",fontsizeMarkUp(1));
  // addbutton(produceIcoSpan('ion-ios-color-filter-outline'),"색 지정",colorMarkUp)
  // addbutton('')
  addline();
  addbutton(produceIcoSpan("ion-ios-camera-outline"),"사진 업로드",uploadImage);
  
  txtarea.parentNode.insertBefore(buttons,txtarea);
  txtarea.parentNode.insertBefore(editstatus,txtarea);
}