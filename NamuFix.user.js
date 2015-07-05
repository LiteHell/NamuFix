// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     150705.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @require     https://github.com/LiteHell/NamuFix/raw/master/FlexiColorPicker.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

GM_addStyle('em{font-style: italic;}');
if(document.querySelector("textarea[name=text]")!=null&&(/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href)){
  // 수정 인터페이스 개선
  GM_xmlhttpRequest({method:"GET",url:"https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFixInterface.css",onload:function(response){GM_addStyle(response.responseText);}});

  // 문서 제목
  var doctitle=document.querySelector('h1.title > a').innerHTML;
  if(document.querySelector("#editForm > input[name=section]")){
   var sectionno=document.querySelector("#editForm > input[name=section]").value;
  }
  var autosavename=doctitle+'###sec-'+sectionno;
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
  };
  var txtarea=document.querySelector("textarea[name=text]");
  var buttons=document.createElement("div");
  var editstatus=document.createElement("div");
  var isSomethingSelected=function(){return txtarea.selectionStart!=txtarea.selectionEnd;};
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
  var getSelected=function(){
    return txtarea.value.substring(txtarea.selectionStart,txtarea.selectionEnd);
  }
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
  };
  var produceIcoSpan=function(icotxt, color){ // http://ionicons.com/
    return '<span class="icon '+icotxt+'" '+ ((typeof color !== 'undefined')?'style="color: '+color+'"':'') +'></span>'
  };
  var WrapWithMarkUp=function(mk,leftadd){
    return function(){
     var l=(typeof leftadd === "undefined")?mk:leftadd;
     if(isSomethingSelected()){
       processSelected(function(txt){
         if(txt.indexOf(mk)!=0 || txt.substring(txt.length-l.length)!=l)
           return mk+txt+l;
         else
           return txt.substring(mk.length,txt.length-l.length);
       });
     } else{
        var t=mk+'내용'+l;
        var s=txtarea.selectionStart;
        insertText(t);
        txtarea.focus();
        txtarea.selectionStart=s+mk.length;
        txtarea.selectionEnd=s+mk.length+2;
      }
    };
  };
  var setStatus=function(txt){
    editstatus.innerHTML=txt;
  }
  var uploadImage=function(){
      // http://jsfiddle.net/eliseosoto/JHQnk/ 이용
      elm.addEventListener("change",function(evt){
        // imgur Client ID : 60a43baebed658a
        var file=evt.target.files[0];
        if(file){
          var reader = new FileReader();
          reader.onload=function(evt){
            var res;
            GM_xmlhttpRequest({
              method: "POST",
              headers:{
                Authorization: "Client-ID 60a43baebed658a",
                Accept: "application/json",
                "Content-Type":"application/x-www-form-urlencoded"
              },
              url:"https://api.imgur.com/3/image",
              data:'type=base64&image='+encodeURIComponent(reader.result.replace(/.*,/,'')),
              onload:function(response){
                res=JSON.parse(response.responseText)
                if(!res["success"]){
                  setStatus("죄송하지만 이미지 업로드에 실패하였습니다.");
                }else{
                  insertText(res["data"]["link"]);
                  //insertText('\n##삭제는 http://imgur.com/delete/'+res["data"]["deletehash"]+'에 접속하여 할 수 있습니다.\n##삭제 링크 외에 기술적으로 자세한 내용은 API 응답을 참고하세요.\n##\n##주석은 지우셔도 되고 삭제 링크 메모후 주석을 지우시는 것을 권장합니다.\n##\n## API 응답 : '+JSON.stringify(res));
                  setStatus('삭제는 <a href="http://imgur.com/delete/'+res["data"]["deletehash"]+'">http://imgur.com/delete/'+res["data"]["deletehash"]+'</a> 에 접속하시여 하실 수 있습니다. 업로드후 한번만 표시되니 지금 메모해주세요.');
                }
              }
            });
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
  };
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
  };
  var formatDate=function(t){
    return t.getFullYear()+'년 '+(t.getMonth()+1)+'월 '+t.getDate()+'일 '+t.getHours()+':'+t.getMinutes()+':'+t.getSeconds();
  }
  var checkAutoSaves=function(){
    var obj=JSON.parse(GM_getValue("AutoSavedDocuments","{}"));
    if(obj[autosavename]==null){
      alert('임시저장이 없습니다.');
      return;
    }
    var promptMsg="번호를 입력해주세요.\n\n";
    var timestamps=[];
    var lastno=0;
    for(var i in obj[autosavename]){
      var savedDate=new Date(Number(i));
      var no=lastno++;
      timestamps.push(i);
      promptMsg+=no+". "+formatDate(savedDate)+"\n";
    }
    var result=prompt(promptMsg);
    if(obj[autosavename][timestamps[result]]==null){
      alert('잘못된 입력입니다.');
      return;
    }
    txtarea.value=obj[autosavename][timestamps[result]];
  };
  var makeAutoSave=function(){
    var obj=JSON.parse(GM_getValue("AutoSavedDocuments","{}"));
    if(obj[autosavename]==null)
      obj[autosavename]={};
    obj[autosavename][Date.now()]=txtarea.value;
    GM_setValue("AutoSavedDocuments",JSON.stringify(obj));
    setStatus("임시저장을 완료하였습니다. ("+formatDate(Date.now())+")");
  };
  var clearAutoSaves=function(){
    if(confirm("해당 문서에 대한 임시저장을 모두 삭제합니다.\n정말 괜찮으십니까?")){
      var obj=JSON.parse(GM_getValue("AutoSavedDocuments","{}"));
      obj[autosavename]=null;
      GM_setValue("AutoSavedDocuments",JSON.stringify(obj));
    }
  }
  var YouTubeMarkUp=function(){
	var ExtractYouTubeID=function(){
	// from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
    if (match&&match[7].length==11)
        return match[7];
	else
		return null;
	}
	var url=prompt("YouTube 동영상 주소를 입력해주세요.");
	var extracted=ExtractYouTubeID(url);
	insertText(extracted!=null?'[[youtube('+extracted+')]]':'\n## YouTube 동영상 ID 추출에 실패하였습니다. 주소를 확인해주세요.');
  }
  var HyperLinkMarkUp=function(){
    // if(/\[\[.+?\]\]/.test(getSelected())){
    //   var linkto=prompt("어디로 링크할까요?",getSelected().replace(/\[\[(.+?)\|.+\]\]|\[\[(.+?)\]\]/,'$1'));
    //   processSeleted(function(txt){
    //     var newlink='';
    //     if(txt.indexOf('|')!=-1){
    //       newlink='[['+linkto+'|'+txt.replace(/\[\[.+\|(.+?)\]\]/,'$1')+']]';
    //     }else{
    //       newlink='[['+linkto+'|'+txt.replace(/\[\[(.+?)\]\]/,'$1')+']]';
    //     }
    //     return newlink;
    //   });
    //
    // }else{
    if(!/\[\[.+?\]\]/.test(getSelected())){
    var linkto=prompt("어디로 링크를 걸까요? 주소(e.g. http://www.example.com/blahblah)나 문서 제목을 입력해주세요.\n\n상위 항목은 ../를 입력해주세요.\n하위 항목은 \"/항목\"(큰따움표 제외)과 같이 입력해주세요.",getSelected());
    if(isSomethingSelected()){
      processSelected(function(txt){
        return linkto!=txt?'[['+linkto+'|'+txt+']]':'[['+linkto+']]';
      });
    }else{
     insertText('[['+linkto+']]')
    }
    }
  };
  var CreateDialog=function(dialogtitle,func){
    var RemoveIfExists=function(sel){
      if(document.querySelector(sel)){
        var selected=document.querySelector(sel);
        selected.parentNode.removeChild(selected);
      }
    }
    RemoveIfExists("#DialogParent");
    RemoveIfExists(".window"); // to Bypass CSS Settings
    var DigParent=document.createElement("div");
    DigParent.id="DialogParent";

    var Dialog=document.createElement("div");
    Dialog.className='window nf_center';
    var DialogTitle=document.createElement('div');
    DialogTitle.className='window_head';
    DialogTitle.innerHTML=dialogtitle;
    var DialogContainer=document.createElement('div');
    DialogContainer.className='window_body';
    var DialogFooter=document.createElement('div');
    DialogFooter.className='window_foot';

    Dialog.appendChild(DialogTitle);
    Dialog.appendChild(DialogContainer);
    Dialog.appendChild(DialogFooter);
    var helper={};
    helper.close=function(){RemoveIfExists('#DialogParent'); RemoveIfExists(".window");}
    helper.footer=DialogFooter;
    helper.addButton=function(label,onclick,color){
      var btn=document.createElement('button');
      btn.setAttribute("type","button");
      btn.className='d_btn f_r';
      if((typeof color !== undefined)&&(color != null)){
        if((['blue','purple','red','yellow','green','black']).indexOf(color)!=-1)
          btn.className+= ' type_'+color;
      }
      btn.innerHTML=label;
      btn.addEventListener('click',onclick);
      DialogFooter.appendChild(btn);
    };
    helper.titleElement=DialogTitle;
    func(DialogContainer,helper);

    DigParent.appendChild(Dialog);
    document.body.appendChild(DigParent);
  }
  var ColouredMarkUp=function(){
    CreateDialog("색 선택",function(container, helper){
      var color='#000000';
      var picker=document.createElement("div");
      picker.className="cp-default";
      container.appendChild(picker);
      ColorPicker(picker,function(hex,hsv,rgb){
        color=hex;
      });
      helper.addButton('적용',function(){
        processSelected(function(txt){
          var pattern=/{{{#[0-9a-zA-Z]+ (.+?)}}}/;
          if(pattern.test(txt)){
            return '{{{'+color+' '+txt.replace(pattern,'$1')+'}}}';
          }else{
            return '{{{'+color+' '+(isEmpty(txt)?'내용':txt)+'}}}';
          }
        },'blue');

        helper.close();
      });
      helper.addButton('닫기',helper.close);
    });
  };
  // HighlightCode Function -> markup.su API, TO-DO
  var BlockquoteMarkUp=function(){
    var s=txtarea.selectionStart;
    var e=txtarea.selectionEnd;
    var txt=txtarea.value.substring(s,e);
    if(s==e) txt="인용문은 앞에 > (> 다음에 띄어쓰기 하나)를 붙이면 됩니다.\n\n 이렇게!"
    var lines=txt.split("\n");
    var result="\n";
    for(var i=0;i<lines.length;i++){
      result+="> "+lines[i]+"\n";
    }
    txtarea.value=txtarea.value.substring(0,s)+result+txtarea.value.substring(e);
  }
  var DaumTVPotMarkUp=function(){
    var vurl=prompt('참고 : 개발중인 기능이므로 이상하게 작동할 수 있습니다.\n\n1. 삽입하고픈 TV팟 동영상을 봅니다\n2. 공유 버튼을 누릅니다.\n3. 거기서 복사한 URL을 입력하십시오.');
    var pattern2=/http:\/\/tvpot\.daum\.net\/v\/(.+?)/;
    if(!pattern2.test(vurl)){
      alert('지원되지 않는 주소 형식입니다.')
    }else{
      insertText('{{{#!html <iframe src="//videofarm.daum.net/controller/video/viewer/Video.html?vid='+vurl.replace(pattern2,'$1')+'&play_loc=undefined&alert=true" style="max-height: 100%; max-width:100%;" frameborder=\'0\' scrolling=\'0\' width=\'640px\' height=\'360px\'></iframe>}}}');
    }
  };
  var LoadTemplate=function(){
    var templateName=prompt('템플릿 문서 이름을 입력하세요.',GM_getValue('lastTemplateName',''));
    var templateUrl='https://namu.wiki/raw/'+templateName;
    var templatePattern=/[a-zA-Z0-9]Template$/;
    if(!templatePattern.test(templateName)){
      if(!confirm('템플릿이 아닌 것 같습니다. 계속 진행할까요?')) return;
    }
    GM_xmlhttpRequest({
      method:"GET",
      url:templateUrl,
      onerror:function(res){
        alert('오류가 발생했습니다!');
      },
      onload:function(res){
        if(res.status===404){
          alert('오류가 발생했습니다! 템플릿 이름이나 인터넷 접속을 확인해주세요.');
        }else {
            txtarea.value=res.responseText;
        }
      }
    });
  }
  buttons.id="EditInterfaceButtons";
  editstatus.id="EditInterfaceStatus";
  // 서식 버튼
  addbutton("<strong>가</strong>","굵게",WrapWithMarkUp("'''"));
  addbutton("<i>가</i>","기울게",WrapWithMarkUp("''"));
  addbutton("<del>가</del>","취소선",WrapWithMarkUp("--"));
  addbutton("<u>가</u>","밑줄",WrapWithMarkUp("__"));
  addbutton("가<sub>가</sub>","아랫첨자",WrapWithMarkUp(",,"));
  addbutton("가<sup>가</sup>","윗첨자",WrapWithMarkUp("^^"));
  addbutton('<span style="font-size:75%">가</span>',"글씨 작게",fontsizeMarkUp(-1));
  addbutton('<span style="font-size:125%">가</span>',"글씨 크게",fontsizeMarkUp(1));
  addbutton('<span style="color:red;">가</span>','색 지정',ColouredMarkUp);
  addbutton('<span style="font-size:0.8em; vertical-align:super; color:blue;">[1]</span>','각주',WrapWithMarkUp("[* ","]"));
  addbutton('<blockquote style="background: #EEE; color:black; font-size:70%; padding:2px;">인용</blockquote>','인용문',BlockquoteMarkUp)
  addbutton('템','템플릿 불려오기',LoadTemplate);
  addbutton('\u2015','수평줄',function(){insertText('\n----\n')});
  addline();
  addbutton(produceIcoSpan("ion-link"),"하이퍼링크/문서링크",HyperLinkMarkUp)
  addbutton(produceIcoSpan("ion-android-image"),"사진 업로드",uploadImage);
  addbutton(produceIcoSpan("ion-social-youtube-outline","red"),"유튜브 동영상 삽입",YouTubeMarkUp)
  addbutton(produceIcoSpan("ion-ios-play-outline","Aqua"),"다음 TV팟 동영상 삽입",DaumTVPotMarkUp);
  addline();
  addbutton(produceIcoSpan("ion-ios-pricetag-outline"),"임시저장",makeAutoSave);
  addbutton(produceIcoSpan("ion-ios-pricetags-outline"),"임시저장 불러오기",checkAutoSaves);
  addbutton(produceIcoSpan("ion-ios-filing-outline"),"임시저장 삭제",clearAutoSaves);

  txtarea.parentNode.insertBefore(buttons,txtarea);
  txtarea.parentNode.insertBefore(editstatus,txtarea);

  function AutoSaveLoop(){
    setTimeout(makeAutoSave,1);
    setTimeout(AutoSaveLoop,300000);
  }
  AutoSaveLoop();
}
