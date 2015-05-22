// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     2.3
// @namespace   http://litehell.info/
// @downloadURL https://gist.github.com/LiteHell/ceccb1ed9d3966b803f6/raw/NamuFix.user.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

// 나무마크 도움말 : https://namu.wiki/w/HelpOnEditing?from=%ED%8E%B8%EC%A7%91%20%EB%8F%84%EC%9B%80%EB%A7%90

GM_addStyle('em{font-style: italic;}');
if(document.querySelector("textarea[name=content]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href)){
  // 수정 인터페이스 개선
  GM_addStyle(GM_xmlhttpRequest({method:"GET",url:"https://gist.github.com/LiteHell/ceccb1ed9d3966b803f6/raw/NamuFixInterface.css",synchronous:true}).responseText); // http://jsfiddle.net/Vestride/dkr9b/ 참고함
  
  var elm=document.createElement("input");
  elm.setAttribute("type","file");
  elm.style.visibility="hidden";
  document.body.appendChild(elm);
  
  var txtarea=document.querySelector("textarea[name=content]");
  var buttons=document.createElement("div");
  var editstatus=document.createElement("div");
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
    txt+=txtarea.value.substring(0,txtarea.selectionStart);
    txt+=func(txtarea.value.substring(txtarea.selectionStart,txtarea.selectionEnd));
    txt+=txtarea.value.substring(txtarea.selectionEnd);
    txtarea.value=txt;
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
  var toMarkUp=function(mk){
    return function(){processSelected(function(txt){return mk+txt+mk;})};
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
  buttons.id="EditInterfaceButtons";
  editstatus.id="EditInterfaceStatus";
  // 서식 버튼
  addbutton("<strong>가</strong>","굵게",toMarkUp("'''"));
  addbutton("<i>가</i>","기울게",toMarkUp("''"));
  addbutton("<del>가</del>","취소선",toMarkUp("--"));
  addbutton("<u>가</u>","밑줄",toMarkUp("__"));
  addbutton("아<sub>Ah</sub>","아랫첨자",toMarkUp(",,"));
  addbutton("아<sup>Ah</sup>","윗첨자",toMarkUp("^^"));
  addline();
  addbutton(produceIcoSpan("ion-ios-camera-outline"),"사진 업로드",uploadImage);
  
  txtarea.parentNode.insertBefore(buttons,txtarea);
  txtarea.parentNode.insertBefore(editstatus,txtarea);
}