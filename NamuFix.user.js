// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://no-ssl.namu.wiki/*
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     150906.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/master/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @require     https://github.com/zenozeng/color-hash/raw/master/dist/color-hash.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @run-at      document-end
// ==/UserScript==
/*
This file is part of NamuFix.

NamuFix is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

NamuFix is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with NamuFix.  If not, see <http://www.gnu.org/licenses/>.

Copyright (C) 2015 Litehell
If you want to contact me, send an email to asdf1234d@gmail.com
*/
var showNotification = function(text) {
  if (!("Notification" in unsafeWindow)) {
    alert(text);
    return;
  }
  var makeNoti = function(permission) {
    if (permission === "granted") {
      var notification = new Notification(text);
    }
  };
  if (Notification.permission === "granted") {
    makeNoti("granted");
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(makeNoti);
  }
}
GM_addStyle("em{font-style: italic;}");
GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.css",
  onload: function(res) {
    GM_addStyle(res.responseText);
  }
});

function nOu(a) {
  return typeof a === 'undefined' || a == null;
}

function formatDateTime(t) {
  var d = new Date(t);
  return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + d.getHours() + '시 ' + d.getMinutes() + '분 ' + d.getSeconds() + '초';
}
if(!String.prototype.format){
  String.prototype.format=function(){
    var newstr=this;
    for(var i=0;i<arguments.length;i++){
      var b='{'+i+'}';
      var a=arguments[i];
      while(newstr.indexOf(b)!=-1) newstr=newstr.replace(b,a);
    }
    return newstr;
  }
}
var ENV = {};
ENV.IsSSL = /^https/.test(location.href);
ENV.IsEditing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/edit\/(.+?)/.test(location.href);
ENV.Discussing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+?)/.test(location.href);
ENV.IsDocument = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/w\/(.+)/.test(location.href); //&& document.querySelector('p.wiki-edit-date');
ENV.IsSettings = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/settings/.test(location.href);
ENV.IsUserPage = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.href);
ENV.IsUploadPage = /^https?:\/\/namu\.wiki\/Upload$/.test(location.href);
ENV.IsDiff = /^https?:\/\/namu\.wiki\/diff\/.+/.test(location.href);
if (document.querySelector("input[name=section]"))
  ENV.section = document.querySelector("input[name=section]").value;
if (ENV.IsEditing)
  ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
else if (ENV.IsDocument)
  ENV.docTitle = document.querySelector("h1.title").innerHTML;
else if (ENV.IsDiff){
  ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
  ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
  ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
}
if (nOu(ENV.section))
  ENV.section = -2;

var SET = new function() {
  var discards = ['save', 'load'];
  this.save = function() {
    for (var i in this) {
      if (discards.indexOf(i) != -1) continue;
      GM_setValue('SET_' + i, this[i]);
    }
  };
  this.load = function() {
    var sets = GM_listValues();
    for (var i = 0; i < sets.length; i++) {
      var now = sets[i];
      if (now.indexOf('SET_') != 0) continue;
      if (discards.indexOf(now) != -1) continue;
      this[now.substring(4)] = GM_getValue(now);
    }
  };
  this.delete = function(key) {
    if (discards.indexOf(key) != -1) return;
    GM_deleteValue(key);
    delete this[key];
  };
};
SET.load();

function INITSET() { // Storage INIT
  if (nOu(SET.dwHashes))
    SET.dwHashes = {};
  if (nOu(SET.dwEnabled))
    SET.dwEnabled = false;
  if (nOu(SET.tempsaves))
    SET.tempsaves = {};
  if (nOu(SET.recentlyUsedTemplates))
    SET.recentlyUsedTemplates = [];
  if (nOu(SET.imgurDeletionLinks))
    SET.imgurDeletionLinks = [];
  if (nOu(SET.discussIdenti))
    SET.discussIdenti = 'icon'; // icon, headBg, none
  if (nOu(SET.discussIdentiLightness))
    SET.discussIdentiLightness = 0.7;
  SET.save();
}
INITSET();
var NEWindow = function() {
  var wi = document.createElement('div');
  var wiHead = document.createElement('div');
  var wiContainer = document.createElement('div');
  var wiFoot = document.createElement('div');

  wi.className = 'NamaEditor NEWindowRoot';
  wiHead.className = 'NamaEditor NEWindowHead';
  wiContainer.className = 'NamaEditor NEWindowContainer';
  wiFoot.className = 'NamaEditor NEWindowFoot';

  wi.appendChild(wiHead);
  wi.appendChild(wiContainer);
  wi.appendChild(wiFoot);

  var wrapper = document.createElement('div');
  wrapper.style.background = 'rgba(0,0,0,0.5)';
  wrapper.style.zIndex = '9999' + NEWindow.WrappingCount++;
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0px';
  wrapper.style.top = '0px';
  wrapper.style.height = '100%';
  wrapper.style.width = '100%';

  wrapper.appendChild(wi);
  document.body.appendChild(wrapper);
  var r = {
    title: function(text) {
      wiHead.innerHTML = text;
      return r;
    },
    content: function(callback) {
      callback(wiContainer);
      return r;
    },
    foot: function(callback) {
      callback(wiFoot);
      return r;
    },
    button: function(label, onclick) {
      var btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.innerHTML = label;
      btn.addEventListener('click', onclick);
      wiFoot.appendChild(btn);
      return r;
    },
    close: function() {
      wrapper.parentNode.removeChild(wrapper);
      return undefined;
    }
  };
  return r;
}
NEWindow.WrappingCount = 0;
var Watcher = new function() {
  var docs = Object.keys(SET.dwHashes);
  docs = docs.sort();
  var docIndex = 0;

  function SHA512(str) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(str);
    return shaObj.getHash("HEX");
  }
  this.runWorker = function(r) {
    SET.load();
    var workerFunc = function() {
      if (!SET.dwEnabled) return;
      if (docs.length <= docIndex) {
        SET.load();
        docs = Object.keys(SET.dwHashes);
        docs = docs.sort();
        docIndex = 0;
      }
      var dNow = docs[docIndex++];
      GM_xmlhttpRequest({
        url: 'https://namu.wiki/raw/' + dNow,
        method: "GET",
        onload: function(res) {
          var dcNow = 'ERR';
          if (res.status == 404) {
            dcNow = '--NOTFOUND';
          } else {
            dcNow = SHA512(res.responseText);
          }
          SET.load();
          if (SET.dwHashes[dNow] != dcNow) {
            if (dcNow != '--NOTFOUND') showNotification('변경 사항 감지됨 : ' + dNow);
            else showNotification('문서가 삭제됨(또는 존재하지 않음) : ' + dNow);
            SET.dwHashes[dNow] = dcNow;
            SET.save();
          }
        }
      });
    };
    setInterval(workerFunc, 5000);
  };
  this.add = function(r) {
    SET.load();
    if (Object.keys(SET.dwHashes).indexOf(r) == -1)
      SET.dwHashes[r] = '';
    SET.save();
  };
  this.remove = function(r) {
    SET.load();
    if (Object.keys(SET.dwHashes).indexOf(r) != -1)
      delete SET.dwHashes[r];
    SET.save();
  };
  this.contains = function(r) {
    SET.load();
    return Object.keys(SET.dwHashes).indexOf(r) != -1;
  }
  this.onoff = function(op) {
    if (typeof op !== "undefined") {
      SET.dwEnabled = op;
      SET.save();
    } else {
      return SET.dwEnabled;
    }
  }
};

function getRAW(title, onfound, onnotfound) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://namu.wiki/raw/' + title,
    onload: function(res) {
      if (res.status == 404) {
        onnotfound(title);
        return;
      }
      onfound(res.responseText, title);
    }
  })
}
if (ENV.IsEditing || ENV.Discussing) {
  if (document.querySelectorAll("textarea").length == 1) {
    var rootDiv = document.createElement("div");

    // Init (Add Elements)
    var buttonBar = document.createElement('div');
    var txtarea = document.createElement('textarea');
    buttonBar.className = 'NamaEditor NEMenu';
    txtarea.className = 'NamaEditor NETextarea'
    txtarea.name = document.querySelector("textarea").name;
    rootDiv.className += ' NamaEditor NERoot';
    rootDiv.appendChild(buttonBar);
    rootDiv.appendChild(txtarea);

    // Functions To Design
    var Designer = {};
    Designer.button = function(txt) {
      var btn = document.createElement('button');
      btn.className = 'NamaEditor NEMenuButton';
      btn.setAttribute('type', 'button');
      btn.innerHTML = txt;

      buttonBar.appendChild(btn);
      var r = {
        click: function(func) {
          btn.addEventListener('click', func);
          return r;
        },
        hoverMessage: function(msg) {
          btn.setAttribute('title', msg);
          return r;
        },
        right: function() {
          btn.className += ' NEright';
          return r;
        },
        active: function() {
          btn.setAttribute('active', 'yes');
          return r;
        },
        deactive: function() {
          btn.removeAttribute('active')
          return r;
        },
        remove: function() {
          btn.parentNode.removeChild(btn);
          return r;
        },
        use: function() {
          buttonBar.appendChild(btn);
          return r;
        }
      };
      return r;
    };
    Designer.dropdown = function(txt) {
      var dropdownButton = document.createElement("div");
      var dropdown = document.createElement("div");
      var dropdownList = document.createElement("ul");
      dropdownButton.innerHTML = '<div class="NEDropdownButtonLabel NamaEditor">' + txt + '</div>';
      dropdownButton.className = 'NamaEditor NEMenuButton';
      dropdown.className = 'NamaEditor NEDropDown';
      dropdown.appendChild(dropdownList);
      dropdownButton.appendChild(dropdown);
      buttonBar.appendChild(dropdownButton);

      var dbHover = false,
        dbBHover = false;
      dropdownButton.addEventListener('mouseover', function() {
        dbBHover = true;
      });
      dropdown.addEventListener('mouseover', function() {
        dbHover = true;
      });
      dropdownButton.addEventListener('mouseleave', function() {
        dbBHover = false;
      });
      dropdown.addEventListener('mouseleave', function() {
        dbHover = false;
      });
      var shower = setInterval(function() {
        if (dbHover || dbBHover) {
          dropdownButton.setAttribute('hover', 'yes');
          dropdown.style.display = '';
        } else {
          dropdownButton.removeAttribute('hover');
          dropdown.style.display = 'none';
        }
      }, 50);

      var hr = {
        button: function(iconTxt, txt) {
          var liTag = document.createElement('li');
          liTag.innerHTML = '<span class="NEHeadIcon">' + iconTxt + '</span><span class="NEDescText">' + txt + '</span>'
          liTag.addEventListener('click', function() {
            dbHover = false;
            dbBHover = false;
          })
          dropdownList.appendChild(liTag);
          var r = {
            icon: function(iconTxt) {
              liTag.querySelector('.NEHeadIcon').innerHTML = iconTxt;
              return r;
            },
            text: function(txt) {
              liTag.querySElector('.NEDescText').innerHTML = txt;
              return r;
            },
            hoverMessage: function(msg) {
              liTag.setAttribute('title', msg);
              return r;
            },
            click: function(handler) {
              liTag.addEventListener('click', handler);
              return r;
            },
            right: function() {
              liTag.className += 'NEright';
              return r;
            },
            remove: function() {
              dropdownList.removeChild(liTag);
              return r;
            },
            insert: function() {
              dropdownList.appendChild(liTag);
              return r;
            },
            backwalk: function() {
              dropdownList.removeChild(ilTag);
              dropdownList.appendChild(ilTag);
              return r;
            }
          };
          return r;
        },
        right: function() {
          liTag.className += 'NEright';
          return hr;
        },
        hoverMessage: function(txt) {
          dropdownButton.setAttribute('title', txt);
          return hr;
        },
        clear: function() {
          dropdownList.innerHTML = '';
          return hr;
        }
      };
      return hr;
    };

    // Functions To Process
    var TextProc = {};
    (function(r, txtarea) {
      r.value = function() {
        if (arguments.length == 0) return txtarea.value;
        else txtarea.value = arguments[0];
      };
      r.selectionText = function() {
        if (arguments.length == 0) return txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
        else {
          var s = txtarea.selectionStart;
          var t = txtarea.value.substring(0, txtarea.selectionStart);
          t += arguments[0];
          t += txtarea.value.substring(txtarea.selectionEnd);
          txtarea.value = t;
          txtarea.focus();
          txtarea.selectionStart = s;
          txtarea.selectionEnd = s + arguments[0].length;
        }
      };
      r.selectionStart = function() {
        if (arguments.length == 0) return txtarea.selectionStart;
        else txtarea.selectionStart = arguments[0];
      };
      r.selectionTest = function(r) {
        return this.selectionText().search(r) != -1;
      };
      r.valueTest = function(r) {
        return this.value().search(r) != -1;
      };
      r.selectionEnd = function() {
        if (arguments.length == 0) return txtarea.selectionEnd;
        else txtarea.selectionEnd = arguments[0];
      };
      r.selectionLength = function() {
        if (arguments.length == 0) return (txtarea.selectionEnd - txtarea.selectionStart);
        else txtarea.selectionEnd = txtarea.selectionStart + arguments[0];
      };
      r.select = function(s, e) {
        txtarea.focus();
        txtarea.selectionStart = s;
        if (typeof e !== 'undefined') txtarea.selectionEnd = e;
      }
      r.WrapSelection = function(l, r) {
        if (arguments.length == 1) var r = l;
        var t = this.selectionText();
        if (typeof t === 'undefined' || t == null || t == '') t = '내용';
        var s = this.selectionStart()
        t = l + t + r;
        this.selectionText(t);
        this.select(s + l.length, s + t.length - r.length)
      };
      r.ToggleWrapSelection = function(l, r) {
        function isWrapped(t) {
          return t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length);
        }
        if (arguments.length == 1) var r = l;
        var t = this.selectionText();
        var t_m = this.value().substring(this.selectionStart() - l.length, this.selectionEnd() + r.length);
        var wrappedInSelection = isWrapped(t);
        var wrappedOutOfSelection = isWrapped(t_m);
        if (wrappedInSelection) {
          var s = this.selectionStart();
          this.selectionText(t.substring(l.length, t.length - r.length));
          this.select(s, s + t.length - l.length - r.length);
        } else if (wrappedOutOfSelection) {
          var s = this.selectionStart() - l.length;
          this.selectionStart(s);
          this.selectionEnd(s + t_m.length);
          this.selectionText(t_m.substring(l.length, t_m.length - r.length));
          this.select(s, s + t_m.length - l.length - r.length);
        } else {
          this.WrapSelection(l, r);
        }
      };
    })(TextProc, txtarea);

    // Some Basic MarkUp Functions
    function FontSizeChanger(isIncrease) {
      var pattern = /^{{{\+([1-5]) (.+?)}}}$/;
      var t, s = TextProc.selectionStart();
      if (TextProc.selectionTest(pattern)) {
        var t = TextProc.selectionText();
        var fontSize = t.replace(pattern, '$1');
        var innerText = t.replace(pattern, '$2');
        if (isIncrease) fontSize++;
        else fontSize--;

        if (5 < fontSize) fontSize = 5;
        if (fontSize < 1) fontSize = 1;
        t = '{{{+' + fontSize + ' ' + innerText + '}}}';
      } else {
        t = '{{{+1 ' + TextProc.selectionText() + '}}}';
      }
      TextProc.selectionText(t);
      TextProc.select(s, s + t.length);
    }

    function TextColorChange() {
      var colorMarkUpPattern = /^{{{(#[a-zA-Z0-9]+) (.*)}}}$/;
      var color = '#000000',
        text = '';
      if (TextProc.selectionTest(colorMarkUpPattern)) {
        // 색상 마크업이 적용된 텍스트
        var matches = colorMarkUpPattern.exec(TextProc.selectionText());
        color = matches[1];
        text = matches[2];
      } else if (TextProc.selectionText().lengh == 0) {
        // 선택된 텍스트 없음
        text = '내용';
      } else {
        // 텍스트 선택됨
        text = TextProc.selectionText();
      }
      var w = window.NEWindow();
      var c = w.close;
      w.title('색 지정').content(function(e) {
        var pickerWrapper = document.createElement('div');
        var sliderWrapper = document.createElement('div');
        var picker = document.createElement('div');
        var slider = document.createElement('div');
        var pickerIndicator = document.createElement('div');
        var sliderIndicator = document.createElement('div');
        pickerWrapper.appendChild(picker);
        pickerWrapper.appendChild(pickerIndicator);
        sliderWrapper.appendChild(slider);
        sliderWrapper.appendChild(sliderIndicator);

        picker.className = "NamaEditor FlexiColorPicker Picker";
        pickerIndicator.className = "NamaEditor FlexiColorPicker PickerIndicator";
        slider.className = "NamaEditor FlexiColorPicker Slider";
        sliderIndicator.className = "NamaEditor FlexiColorPicker SliderIndicator";
        pickerWrapper.className = "NamaEditor FlexiColorPicker PickerWrapper";
        sliderWrapper.className = "NamaEditor FlexiColorPicker SliderWrapper";

        ColorPicker.fixIndicators(
          sliderIndicator,
          pickerIndicator
        )
        ColorPicker(slider, picker, function(hex, hsv, rgb, pickerCo, sliderCo) {
          ColorPicker.positionIndicators(
            sliderIndicator,
            pickerIndicator,
            sliderCo, pickerCo
          )
          color = hex;
        }).setHex(color);
        e.appendChild(pickerWrapper);
        e.appendChild(sliderWrapper);
      }).button('지정', function() {
        TextProc.selectionText('{{{' + color + ' ' + text + '}}}');
        c();
      }).button('닫기', c);
    }

    // Add Basic MarkUp Buttons
    var decoDropdown = Designer.dropdown('<span class="ion-wand"></span>').hoverMessage('텍스트 꾸미기');
    decoDropdown.button('<strong>A</strong>', '굵게').click(function() {
      TextProc.ToggleWrapSelection("'''");
    });
    decoDropdown.button('<em>A</em>', '기울임꼴').click(function() {
      TextProc.ToggleWrapSelection("''");
    });
    decoDropdown.button('<del>A</del>', '취소선').click(function() {
      TextProc.ToggleWrapSelection("--");
    });
    decoDropdown.button('<span style="text-decoration: underline;">A</span>', '밑줄').click(function() {
      TextProc.ToggleWrapSelection("__");
    });
    decoDropdown.button('<span style="color:red;">A</span>', '글씨색').click(TextColorChange);
    decoDropdown.button('-', '글씨 작게').click(function() {
      FontSizeChanger(false);
    });
    decoDropdown.button('+', '글씨 크게').click(function() {
      FontSizeChanger(true);
    });

    // Insertable Media Functions
    function ImgurUpload() {
      var elm = document.createElement("input");
      elm.setAttribute("type", "file");
      elm.style.visibility = "hidden";
      elm.setAttribute("accept", "image/*");
      document.body.appendChild(elm);
      // http://jsfiddle.net/eliseosoto/JHQnk/ 이용
      elm.addEventListener("change", function(evt) {
        if (evt.target.files.length > 1) {
          alert('한개의 파일만 업로드하실 수 있습니다.');
          return;
        } else if (evt.target.files.length < 0) {
          alert('선택된 파일이 없습니다.');
          return;
        }
        var win = NEWindow();
        win.title('Imgur 업로드');
        win.content(function(el) {
          el.innerHTML = '<span id="msg">진행중입니다. 잠시만 기다려주세요....</span><br>이미지 삭제 주소는 <a href="https://namu.wiki/settings" target="_blank">NamuFix 설정 페이지</a>를 참고하세요.'
        });
        var setMsg = function(msg) {
            win.content(function(el) {
              el.querySelector('span#msg').innerHTML = msg;
            });
          }
          // imgur Client ID : 60a43baebed658a
        var file = evt.target.files[0];
        if (file) {
          setMsg('전송중입니다. 잠시만 기다려주세요.....');
          var reader = new FileReader();
          reader.onload = function(evt) {
            var res;
            GM_xmlhttpRequest({
              method: "POST",
              headers: {
                Authorization: "Client-ID 60a43baebed658a",
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
              },
              url: "https://api.imgur.com/3/image",
              data: 'type=base64&image=' + encodeURIComponent(reader.result.replace(/.*,/, '')),
              onload: function(response) {
                res = JSON.parse(response.responseText)
                if (!res["success"]) {
                  alert("죄송하지만 이미지 업로드에 실패하였습니다.");
                  NE.close();
                } else {
                  var deleteLink = 'http://imgur.com/delete/' + res["data"]["deletehash"];
                  var imageDirectLink = res["data"]["link"];
                  setMsg('완료됬습니다.');
                  SET.load();
                  SET.imgurDeletionLinks.push({
                    imgUrl: imageDirectLink,
                    deleteionUrl: deleteLink,
                    uploadedAt: Date.now()
                  });
                  SET.save();
                  win.close();
                  TextProc.selectionText(TextProc.selectionText() + ' ' + imageDirectLink + ' ');
                }
              }
            });
            document.body.removeChild(elm);
          };
          setMsg('진행중입니다. 파일을 읽고있습니다....');
          reader.readAsDataURL(file);
        }
      });
      elm.click();
      // imgur Client ID : 60a43baebed658a
    };

    // Insertable Media Functions
    function InsertYouTube() {
      var win = NEWindow();
      win.title('YouTube 동영상 삽입');
      win.content(function(el) {
        el.innerHTML = '<p style="background: cyan; box-shadow: 2px 2px 2px gray; color:white; padding: 8px; border-radius: 3px; margin-bottom: 5px;">YouTube 동영상을 검색하거나 동영상 주소를 입력하여 YouTube 동영상을 삽입할 수 있습니다.</p>' +
          '<p><label for="vidUrl" style="width: 120px; display: inline-block;">YouTube 동영상 주소</label><input type="text" name="vidUrl" id="vidUrl" style="width:620px;"></input><button id="insertUrl">삽입</button></p>' +
          '<hr>' +
          '<div>' +
          '<label for="vidQuery" style="width: 120px; display: inline-block;">검색어</label><input type="text" name="vidQuery" id="vidQuery" style="width:620px;"></input><button id="searchVids">검색</button>' +
          '<div id="results" style="overflow-y: scroll; overflow-x: hidden; width: 820px; min-width: 820px; height: 400px;"><span style="color:red">검색 결과가 없습니다.</span></div>' +
          '</div>';
      })
      var finish = function(vid) {
          if (vid == null) {
            alert('무언가 잘못된것 같습니다.');
            return;
          }
          TextProc.selectionText(TextProc.selectionText() + '[youtube(' + vid + ')]');
          win.close();
        }
        // 주소로 삽입 기능
      win.content(function(el) {
        var ExtractYouTubeID = function(url) {
          // from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match && match[7].length == 11)
            return match[7];
          else
            return null;
        }
        var insertByUrlFunc = function() {
          var url = el.querySelector('#vidUrl').value;
          var vidId = ExtractYouTubeID(url);
          finish(vidId);
        }
        el.querySelector('#insertUrl').addEventListener('click', insertByUrlFunc);
        el.querySelector('#vidUrl').addEventListener('keyup', function(evt) {
          if (evt.which == 13 || evt.keycode == 13) {
            insertByUrlFunc();
            return false;
          }
        })
      });
      // 검색 기능
      win.content(function(el) {
        // https://developers.google.com/youtube/v3/docs/search/list
        var baseUri = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&';
        var basicSearchUri = baseUri + 'part=snippet&safeSearch=none&type=video&maxResults=20&videoEmbeddable=true&q=';
        var vidSearchFunc = function() {
          var q = el.querySelector('#vidQuery').value;
          var resultDiv = el.querySelector('#results');
          resultDiv.innerHTML = '<span style="color:orange;">검색중입니다.</span>'
          GM_xmlhttpRequest({
            method: "GET",
            url: basicSearchUri + encodeURIComponent(q),
            onload: function(res) {
              resultDiv.innerHTML = '<ul></ul>';
              var ul = resultDiv.querySelector('ul');
              if (res.status != 200) {
                resultDiv.innerHTML = '<span style="color:red;">검색중 오류가 발생했습니다.</span>';
                return;
              }
              var jobj = JSON.parse(res.responseText);
              for (var i = 0; i < jobj.items.length; i++) {
                var vidNow = jobj.items[i];
                var li = document.createElement("li");
                li.height = '90px';
                li.innerHTML = '<img style="height: 90px;" src="' + vidNow.snippet.thumbnails.default.url + '"></img>' +
                  '<div style="position: relative; display: inline-block; margin-left: 5px; overflow: hidden; width: 670px;">' +
                  '<span style="font-weight: bold; font-size: 12pt; margin-bottom: 3px;">' + vidNow.snippet.title + '</span><button name="insertThis" class="moreFlat">삽입</button><button name="preview" class="moreFlat">미리보기</button><br><span style="font-size:10pt;">' + vidNow.snippet.description + '</span>' +
                  '</div>';
                li.querySelector('[name="preview"]').parentNode.dataset.videoId = vidNow.id.videoId;
                li.querySelector('[name="preview"]').addEventListener('click', function(evt) {
                  var previewWin = NEWindow();
                  previewWin.title('미리보기');
                  previewWin.content(function(el) {
                    var iframe = document.createElement("iframe");
                    iframe.setAttribute("frameborder", "0");
                    iframe.setAttribute("src", "//www.youtube.com/embed/" + evt.target.parentNode.dataset.videoId);
                    iframe.setAttribute("height", "360px");
                    iframe.setAttribute("width", "640px");
                    el.appendChild(iframe);
                  });
                  previewWin.button('닫기', previewWin.close);
                });
                li.querySelector('[name="insertThis"]').addEventListener('click', function(evt) {
                  finish(evt.target.parentNode.dataset.videoId);
                })
                ul.appendChild(li);
              }
            }
          });
        };

        el.querySelector('#searchVids').addEventListener('click', vidSearchFunc);
        el.querySelector('#vidQuery').addEventListener('keyup', function(evt) {
          if (evt.which == 13 || evt.keycode == 13) {
            vidSearchFunc();
            return false;
          }
        })
        el.querySelector('#vidUrl').focus();
      })
      win.button('닫기', win.close);
    }

    function MapMacro() {
      // title(text), content(callback), foot(callback), button(text,onclick), close
      var win = NEWindow();
      win.title("지도 삽입");
      win.content(function(el) {
        var mapDiv = document.createElement("div");
        mapDiv.id = "NFMapDiv";
        mapDiv.style.height = '480px';
        mapDiv.style.width = '640px';
        el.appendChild(mapDiv);
        var initFuncContext = 'var NFMap;\n' +
          'function NFMapInit(){\n' +
          'var firstLocation=new google.maps.LatLng(37.46455,126.67435);\n' +
          'var mapOptions={\n' +
          'zoom: 8,\n' +
          'center: firstLocation\n,' +
          'streetViewControl: false\n' +
          '};\n' +
          'NFMap=new google.maps.Map(document.querySelector("#NFMapDiv"),mapOptions);\n' +
          '}';
        var onloadScript = document.createElement("script");
        onloadScript.innerHTML = initFuncContext;
        el.appendChild(onloadScript);
        setTimeout(function() {
          var mapsAPILib = document.createElement("script");
          mapsAPILib.setAttribute("src", "//maps.googleapis.com/maps/api/js?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&callback=NFMapInit");
          el.appendChild(mapsAPILib);
        }, 500);
      });
      win.button("삽입", function() {
        var lat = unsafeWindow.NFMap.getCenter().lat();
        var lng = unsafeWindow.NFMap.getCenter().lng();
        var zoom = unsafeWindow.NFMap.getZoom();
        TextProc.selectionText(TextProc.selectionText() + ' [Include(틀:지도,장소=' + lat + '%2C' + lng + ',zoom=' + zoom + ')] ');
        win.close();
      })
      win.button("닫기", win.close);
    }

    function DaumTVPotMarkUp() {
      var vurl = prompt('참고 : 개발중인 기능이므로 이상하게 작동할 수 있습니다.\n\n1. 삽입하고픈 TV팟 동영상을 봅니다\n2. 공유 버튼을 누릅니다.\n3. 거기서 복사한 URL을 입력하십시오.');
      var pattern2 = /http:\/\/tvpot\.daum\.net\/v\/(.+?)/;
      if (!pattern2.test(vurl)) {
        alert('지원되지 않는 주소 형식입니다.')
      } else {
        insertText('{{{#!html <iframe src="//videofarm.daum.net/controller/video/viewer/Video.html?vid=' + vurl.replace(pattern2, '$1') + '&play_loc=undefined&alert=true" style="max-height: 100%; max-width:100%;" frameborder=\'0\' scrolling=\'0\' width=\'640px\' height=\'360px\'></iframe>}}}');
      }
    };
    // Add Insertable Things
    var insertablesDropDown = Designer.dropdown('<span class="ion-paperclip"></span>').hoverMessage('삽입 가능한 미디어');
    insertablesDropDown.button('<span class="ion-image"></span>', '사진(Imgur 익명 업로드)').click(ImgurUpload);
    insertablesDropDown.button('<span class="ion-social-youtube" style="color:red;"></span>', 'YouTube 동영상').click(InsertYouTube);
    insertablesDropDown.button('<span class="ion-map"></span>', '지도').click(MapMacro);
    insertablesDropDown.button('<span class="ion-ios-play-outline" style="color: Aqua;"></span>', '다음 TV팟 동영상').click(DaumTVPotMarkUp);
    if (ENV.IsEditing) {
      // Manager Class
      var tempsaveManager = new function() {
        var ht = this;
        this.getTitles = function() {
          var r = [];
          for (var i in SET.tempsaves) {
            r.push(i);
          }
          return r;
        }
        this.getByTitle = function(docTitle) {
          SET.load();
          if (nOu(SET.tempsaves[docTitle])) {
            SET.tempsaves[docTitle] = [];
            SET.save();
          }
          return SET.tempsaves[docTitle]; // {section, text, timestamp}
        };
        this.getByTitleAndSectionNo = function(docTitle, sectno) {
          SET.load();
          var b = ht.getByTitle(docTitle);
          var a = [];
          for (var i = 0; i < b.length; i++) {
            if (b[i].section == sectno)
              a.push(b[i]);
          }
          return a;
        }
        this.save = function(docTitle, sectno, timestamp, text) {
          SET.load();
          if (nOu(SET.tempsaves[docTitle])) {
            SET.tempsaves[docTitle] = [];
            SET.save();
          }
          SET.tempsaves[docTitle].push({
            section: sectno,
            timestamp: timestamp,
            text: text
          });
          SET.save();
        }
        this.delete = function(docTitle, sectno, timestamp) {
          SET.load();
          if (nOu(SET.tempsaves[docTitle])) return;
          var newArray = [];
          for (var i = 0; i < SET.tempsaves[docTitle].length; i++) {
            var keepThis = true;
            var now = SET.tempsaves[docTitle][i];
            switch (arguments.length) {
              case 1:
                keepThis = false;
                break;
              case 2:
                if (now.section == sectno) keepThis = false;
                break;
              case 3:
                if (now.section == sectno && now.timestamp == timestamp) keepThis = false;
                break;
            }
            if (keepThis) {
              newArray.push(SET.tempsaves[docTitle][i]);
            }
          }
          SET.tempsaves[docTitle] = newArray;
          SET.save();
        }
        this.MigrateIfThereIs = function() {
          SET.load();
          var autosaves = JSON.parse(GM_getValue("AutoSavedDocuments", "null"));
          if (autosaves != null) {
            var pattern = /(.+?)###sec-(.+?)/;
            for (var i in autosaves) {
              var matches = pattern.exec(i);
              var title = matches[1];
              var sectno = matches[2];
              if (nOu(SET.tempsaves[title])) {
                SET.tempsaves[title] = [];
              }
              for (var ii in autosaves[i]) {
                ht.save(title, sectno, ii, autosaves[i][ii]);
              }
            }
            SET.save();
            GM_setValue("AutoSavedDocuments", "null");
          }
        };
      }
      tempsaveManager.MigrateIfThereIs();
      // Tempsave Menu
      var tempsaveDropdown = Designer.dropdown('<span class="ion-ios-pricetags-outline"></span>').hoverMessage('임시저장');
      tempsaveDropdown.button('<span class="ion-ios-pricetag-outline"></span>', '임시저장').click(function() {
        tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
      });
      tempsaveDropdown.button('<span class="ion-filing"></span>', '임시저장 불려오기').click(function() {
        // title(text), content(callback), foot(callback), button(text,onclick), close
        var win = NEWindow();
        win.title('임시저장 불려오기')
        var tempsaveList = tempsaveManager.getByTitle(ENV.docTitle);
        win.content(function(el) {
          el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.<br>문단 번호가 -2인 경우는 문단 번호가 감지되지 않은 경우입니다.</p>';
          var divWithscrollbars = document.createElement("div");
          divWithscrollbars.style.height = '300px';
          divWithscrollbars.style.overflow = 'auto';
          var table = document.createElement("table");
          var headrow = document.createElement("tr");
          headrow.innerHTML = '<th>문단 번호</th><th>저장된 날짜와 시간</th><th>불려오기 버튼</th>';
          table.appendChild(headrow);
          for (var i = 0; i < tempsaveList.length; i++) {
            var now = tempsaveList[i];
            var tr = document.createElement("tr");
            tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + now.section + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
            var td = document.createElement("td");
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "불려오기";
            btn.dataset.json = JSON.stringify(now);
            btn.addEventListener('click', function(evt) {
              var now = JSON.parse(evt.target.dataset.json);
              txtarea.value = now.text;
            });
            td.appendChild(btn);
            tr.appendChild(td);
            table.appendChild(tr);
          }
          divWithscrollbars.appendChild(table);
          el.appendChild(divWithscrollbars);
        });
        win.button('닫기', win.close);
      });
      tempsaveDropdown.button('<span class="ion-trash-a" style="color:red;"></span>', '이 문서의 모든 임시저장 삭제').click(function() {
        tempsaveManager.delete(ENV.docTitle);
      });
      tempsaveDropdown.button('<span class="ion-trash-a" style="color:orangered;"></span>', '이 문서의 이 문단의 모든 임시저장 삭제').click(function() {
        tempsaveManager.delete(ENV.docTitle, ENV.section);
      });
      tempsaveDropdown.button('<span class="ion-trash-a" style="color:orange;"></span>', '특정 임시저장만 삭제').click(function() {
        // title(text), content(callback), foot(callback), button(text,onclick), close
        var win = NEWindow();
        var tempsaveList = tempsaveManager.getByTitle(ENV.docTitle);
        win.title('임시저장 삭제');
        win.content(function(el) {
          el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.<br>문단 번호가 -2인 경우는 문단 번호가 감지되지 않은 경우입니다.</p>';
          var divWithscrollbars = document.createElement("div");
          divWithscrollbars.style.height = '300px';
          divWithscrollbars.style.overflow = 'auto';
          var table = document.createElement("table");
          var headrow = document.createElement("tr");
          headrow.innerHTML = '<th>문단 번호</th><th>저장된 날짜와 시간</th><th>삭제 버튼</th>';
          table.appendChild(headrow);
          for (var i = 0; i < tempsaveList.length; i++) {
            var now = tempsaveList[i];
            var tr = document.createElement("tr");
            tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + now.section + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
            var td = document.createElement("td");
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.innerHTML = "삭제하기";
            btn.dataset.json = JSON.stringify(now);
            btn.addEventListener('click', function(evt) {
              var now = JSON.parse(evt.target.dataset.json);
              tempsaveManager.delete(ENV.docTitle, now.section, now.timestamp);
              win.close();
            });
            td.appendChild(btn);
            tr.appendChild(td);
            table.appendChild(tr);
          }
          divWithscrollbars.appendChild(table);
          el.appendChild(divWithscrollbars);
        });
        win.button('닫기', win.close);
      });
      setInterval(function() {
        tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
      }, 600000);
    }
    // Template Insert Feature
    var templatesDropdown = Designer.dropdown('<span class="ion-ios-copy-outline"></span>').hoverMessage('템플릿 삽입/최근에 사용한 템플릿');
    var refreshTemplatesDropdown = function() {
      SET.load();
      templatesDropdown.clear();
      var rutl = SET.recentlyUsedTemplates.length;

      function InsertTemplateClosure(na) {
        return function() {
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://namu.wiki/raw/' + na,
            onload: function(res) {
              if (res.status == 404) {
                alert('존재하지 않는 템플릿입니다.');
                return;
              }
              SET.load();
              if (SET.recentlyUsedTemplates.indexOf(na) == -1) SET.recentlyUsedTemplates.push(na);
              SET.save();
              txtarea.value = res.responseText;
              setTimeout(refreshTemplatesDropdown, 300);
            }
          })
        };
      }
      for (var i = 0; i < (rutl < 5 ? rutl : 5); i++) {
        templatesDropdown.button('<span class="ion-ios-paper-outline"></span>', SET.recentlyUsedTemplates[i]).click(InsertTemplateClosure(SET.recentlyUsedTemplates[i]));
      }
      templatesDropdown.button('<span class="ion-close-round"></span>', '기록 삭제').click(function() {
        SET.load();
        SET.recentlyUsedTemplates = [];
        SET.save();
        setTimeout(refreshTemplatesDropdown, 300);
      });
      templatesDropdown.button('<span class="ion-plus-round"></span>', '템플릿 삽입').click(function() {
        var templateName = prompt('템플릿 이름을 입력하세요.');
        if (!/^템플릿:.+/.test(templateName) && !/.+Template$/.test(templateName) && !confirm('올바른 템플릿 이름이 아닌 것 같습니다. 계속할까요?')) return;
        InsertTemplateClosure(templateName)();
        setTimeout(refreshTemplatesDropdown, 300);
      });
    };
    setTimeout(refreshTemplatesDropdown, 500);

    // set Size
    if (ENV.Discussing)
      rootDiv.style.height = '170px';
    else
      rootDiv.style.height = '600px';

    // Add Keyboard Shortcut
    txtarea.addEventListener('keyup', function(evt) {
      if (evt.ctrlKey && evt.altKey) {
        switch (evt.keyCode) { // Ctrl
          case 66: // B
          case 98:
            TextProc.ToggleWrapSelection("'''");
            break;
          case 73: // I
          case 105:
            TextProc.ToggleWrapSelection("''");
            break;
          case 68: // D
          case 100:
            TextProc.ToggleWrapSelection("--");
            break;
          case 85: // U
          case 117:
            TextProc.ToggleWrapSelection("__");
            break;
          case 219:
          case 123:
          case 91: // [
            FontSizeChanger(false);
            break;
          case 221:
          case 125:
          case 93: // ]
            FontSizeChanger(true);
            break;
        }
      } else if (evt.ctrlKey && evt.shiftKey) { // Ctrl + Shift
        switch (evt.keyCode) {
          case 83: // S
          case 115:
            tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
            break;
          case 73: // I
          case 105:
            ImgurUpload();
            break;
        }
      } else {
        return;
      }
      return false;
    });

    // Add NamuFix Div
    var oldTextarea = document.querySelector("textarea");
    var wText = oldTextarea.value;
    oldTextarea.parentNode.insertBefore(rootDiv, oldTextarea);
    oldTextarea.parentNode.removeChild(oldTextarea);
    txtarea.value = wText;

    var srwPattern = /\?redirectTo=([^\&]+)/;
    if (srwPattern.test(location.search)) {
      if ((txtarea.value.trim().search(/^#redirect .+/) == 0 || txtarea.value.trim().length == 0) || confirm('빈 문서가 아닌것 같습니다만 그래도 계속?')) {
        txtarea.value = '#redirect ' + decodeURIComponent(srwPattern.exec(location.search)[1]);
        if (document.querySelectorAll('iframe[title="CAPTCHA 위젯"]').length == 0) {
          if (document.querySelector("input#logInput")) document.querySelector("input#logInput").value = "NamuFix를 이용하여 자동 리다이렉트 처리됨.";
          document.querySelector('#editBtn').click();
        }
      }
    }
  }
} else if (ENV.IsDocument) {
  // 버튼 추가 함수
  function addButton(text, onclick) {
    var btn = document.createElement("li");
    btn.className = "f_r";
    var aTag = document.createElement("a");
    aTag.innerHTML = text;
    aTag.setAttribute("href", "#NothingToLink");
    aTag.addEventListener('click', onclick);
    btn.appendChild(aTag);
    document.querySelector('ul.tab_bar').appendChild(btn);
  };

  // 주시 버튼 추가
  if (Watcher.onoff()) {
    addButton(Watcher.contains(ENV.docTitle) ? '주시해제' : '주시', function(evt) {
      if (Watcher.contains(ENV.docTitle)) {
        Watcher.remove(ENV.docTitle);
        evt.target.innerHTML = '주시';
      } else {
        Watcher.add(ENV.docTitle);
        evt.target.innerHTML = '주시해제';
      }
    });
  }

  // 리다이렉트 버튼 추가
  addButton('리다이렉트', function(evt) {
    var redirectFrom = prompt('어느 문서에서 지금 이문서로 리다이렉트?');
    if (redirectFrom != null && redirectFrom.trim().length != 0)
      location.href = 'https://namu.wiki/edit/' + redirectFrom + '?redirectTo=' + ENV.docTitle;
  });
  // 상위 문서로의 링크
  if (ENV.docTitle.indexOf('/') != -1) {
    function spSplit(a, b) {
      var splitted = a.split(b);
      var result = [];
      for (var i = 1; i <= splitted.length; i++) {
        var now = '';
        for (var ii = 0; ii < i; ii++) {
          var append = splitted[ii];
          if (ii != i - 1) append += '/';
          now += append;
        }
        result.push(now);
      }
      return result;
    }
    var higherDocsWE = {};
    var higherDocs = spSplit(ENV.docTitle, '/');
    for (var i = 0; i < higherDocs.length; i++) {
      higherDocsWE[i] = null;
    }
    var codwe = 0;
    var codwnf = 0;
    for (var i = 0; i < higherDocs.length; i++) {
      getRAW(higherDocs[i], function(r, t) {
        higherDocsWE[t] = true;
        codwe++;
      }, function(t) {
        higherDocsWE[t] = false;
        codwnf++;
      });
      if (i == higherDocs.length - 1) {
        var hdinid = setInterval(function() {
          if (codwe + codwnf != higherDocs.length) return;
          var docTitleTag = document.querySelector('h1.title');
          var hdsPT = document.createElement("p");
          var sstl = 0;
          for (var i = 0; i < higherDocs.length; i++) {
            if (!higherDocsWE[higherDocs[i]]) continue;
            var higherDoc = higherDocs[i];
            var a = document.createElement("a");
            a.setAttribute("href", '/w/' + encodeURIComponent(higherDoc));
            a.setAttribute("title", higherDoc);
            a.className = "wiki-link-internal";
            if (i != 0 && higherDoc.substring(sstl).indexOf('/') == 0)
              a.innerHTML = higherDoc.substring(sstl + 1);
            else
              a.innerHTML = higherDoc.substring(sstl);
            sstl = higherDoc.length;
            hdsPT.appendChild(a);
            if (i != higherDocs.length - 1) hdsPT.appendChild(document.createTextNode(" > "));
          }
          docTitleTag.style.marginBottom = '0px';
          hdsPT.style.marginBottom = '25px';
          docTitleTag.parentNode.insertBefore(hdsPT, docTitleTag.nextSibling);
          clearInterval(hdinid);
        }, 200);
      }
    }
  }
} else if (ENV.IsSettings) {
  var aside = document.querySelector("aside > ul.nav_list");
  var li = document.createElement("li");
  var a = document.createElement("a");
  a.innerHTML = "NamuFix";
  a.className = "menu-item";
  a.setAttribute("href", "#NamuFixSettings");
  li.appendChild(a);
  aside.appendChild(li);

  var pages = document.querySelector("section");
  var page = document.createElement("div");
  page.innerHTML = '<h3>NamuFix</h3>';
  page.className = "tab_page";
  page.style.display = "none";
  page.id = "NamuFixSettings";

  function appendButton(text, onclick) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.className = "d_btn type_blue";
    btn.innerHTML = text;
    btn.addEventListener("click", onclick);
    page.appendChild(btn);
    page.appendChild(document.createElement("br"));
  }
  appendButton("NamuFix 설정", function() {
    var win = NEWindow();
    var elems = {};
    win.title('NamuFix 설정');
    SET.load();
    win.content(function(el) {
      el.innerHTML = '<input type="checkbox" id="enableDw"></input> 문서주시기능 활성화<br>' +
        '<style>h1.wsmall{font-size: 14pt;}</style>' +
        '<h1 class="wsmall">토론 아이덴티콘</h1>' +
        '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="icon">디시라이트 갤러콘 방식<br>' +
        '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="headBg">스레딕 헬퍼 방식<br>' +
        '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="none">사용 안함' +
        '<h1 class="wsmall">토론 아이덴티콘 명도</h1>' +
        '<p>스레딕 헬퍼 방식을 사용하는 경우에만 적용됩니다.</p>' +
        '<label for="discussIdentiLightness">명도</label><input name="discussIdentiLightness" data-setname="discussIdentiLightness" type="range" max="1" min="0" step="0.01">';
      el.querySelector('#enableDw').checked = Watcher.onoff();
      elems['enableDw'] = el.querySelector('#enableDw');
      var optionTags = document.querySelectorAll('[data-setname]');
      SET.load();
      for (var i = 0; i < optionTags.length; i++) {
        var tag = optionTags[i];
        var t = tag.getAttribute('type');
        var sn = tag.dataset.setname;
        if (t == "radio" && tag.dataset.setvalue == SET[sn]) {
          tag.checked = true;
        } else if (t == "checkbox" && tag.dataset.setvalueOnChecked == SET[sn]) {
          tag.checked = true;
        } else if (["text", "password", "number", "range"].indexOf(t) != -1) {
          tag.value = ["number", "range"].indexOf(t) != -1 ? Number(SET[sn]) : SET[sn];
        }
      }
    });
    win.button('저장하지 않고 닫기', win.close);
    win.button('저장하고 닫기', function() {
      var optionTags = document.querySelectorAll('[data-setname]');
      SET.load();
      for (var i = 0; i < optionTags.length; i++) {
        var tag = optionTags[i];
        var t = tag.getAttribute('type');
        var sn = tag.dataset.setname;
        if (t == "radio" && tag.checked) {
          SET[sn] = tag.dataset.setvalue;
        } else if (t == "checkbox") {
          SET[sn] = tag.checked ? t.dataset.setvalueOnChecked : t.dataset.setvalueOnUnchecked;
        } else if (["text", "password", "number", "range"].indexOf(t) != -1) {
          SET[sn] = tag.value;
        }
      }
      SET.save();
      Watcher.onoff(elems['enableDw'].checked);
      win.close();
    });
  });
  appendButton("Imgur 이미지 삭제 주소들", function() {
    SET.load();
    var win = NEWindow();
    var divWithScrolls = document.createElement("div");
    divWithScrolls.style.overflow = 'scroll';
    divWithScrolls.style.maxHeight = '800px';
    divWithScrolls.style.maxWidth = '1200px';

    var table = document.createElement("table");
    table.innerHTML = '<tr><th style="min-width: 200px;">업로드한 날짜/시각</th><th>이미지 주소(다이렉트)</th><th>이미지 삭제 주소</th></tr>';
    var addRow = function(dt, dil, del) {
      var tr = document.createElement("tr");
      var appendTd = function(t) {
        var td = document.createElement("td");
        td.innerHTML = t;
        tr.appendChild(td);
      }
      appendTd(formatDateTime(dt));
      appendTd('<a href="' + dil + '" target="_blank">' + dil + '</a>');
      appendTd('<a href="' + del + '" target="_blank">' + del + '</a>');
      table.appendChild(tr);
    }
    for (var i = 0; i < SET.imgurDeletionLinks.length; i++) {
      var ii = SET.imgurDeletionLinks[i];
      addRow(ii.uploadedAt, ii.imgUrl, ii.deleteionUrl);
    }
    win.content(function(el) {
      el.appendChild(table);
    });
    win.title('이미지 삭제 주소들');
    win.button('닫기', win.close);
  })
  pages.appendChild(page);
}
if (ENV.Discussing) {
  setInterval(function() {
    var messages = document.querySelectorAll('.res');
    var isIcon = SET.discussIdenti == 'icon';
    var isThreadicLike = SET.discussIdenti == 'headBg';
    var colorHash = isThreadicLike ? new ColorHash({
      lightness: Number(SET.discussIdentiLightness)
    }) : new ColorHash();
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (isIcon && message.querySelector('.first-author')) continue;
      if (message.querySelector('[data-nfbeauty]')) continue;
      var n = message.querySelector('.r-head > a').innerHTML;
      if (n.indexOf("/contribution/author") == 0) {
        // 로그인
        n = '!ID!' + n;
      } else {
        // IP
        n = '!IP!' + n;
      }
      console.log('n : ' + colorHash.hex(n));

      if (isThreadicLike) {
        message.querySelector('.r-head').style.background = colorHash.hex(n);
        message.querySelector('.r-head').style.color = 'white';
        message.querySelector('.r-head > a').style.color = 'white';
        message.querySelector('.r-head .num a').style.color = 'white';
      } else if (isIcon) {
        var a = message.querySelector('.r-head > a');
        var nonColoredSpan = document.createElement("span");
        nonColoredSpan.innerHTML = '　';
        var span = document.createElement("span");
        span.style.background = colorHash.hex(n);
        span.style.color = colorHash.hex(n);
        span.innerHTML = '__';
        a.appendChild(nonColoredSpan);
        a.appendChild(span);
      }
      message.querySelector('.r-head > a').dataset.nfbeauty = true;
    }
  }, 200);
} else if (ENV.IsUserPage) {
  var p = document.createElement("p");
  if (/\/document$/.test(location.href)) {
    var rows = document.querySelectorAll('table tr');
    var contCount = 0,
      contTotalBytes = 0,
      contDocuments = 0;
    var documents = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row.querySelectorAll('a').length == 0) continue;
      var documentName = row.querySelector('a').getAttribute('href');
      var contributedBytes = row.querySelector('span.f_r > span').innerHTML;
      var negativeContribution = /^\-[0-9]+/.test(contributedBytes);
      if (/^\+[0-9]+/.test(contributedBytes)) contributedBytes = contributedBytes.substring(contributedBytes.indexOf('+'));
      contributedBytes = Number(contributedBytes);
      if (documents.indexOf(documentName) == -1) documents.push(documentName);
      contCount++;
      if (negativeContribution)
        contTotalBytes -= contributedBytes;
      else
        contTotalBytes += contributedBytes;
    }
    p.innerHTML = '총 기여 수 : ' + contCount + '<br>총 기여한 바이트 수 : ' + contTotalBytes + '<br>총 기여한 문서 (ACL 변경, 문서 이동 포함) : ' + documents.length + '<br>한 문서당 평균 기여 바이트 수 : ' + (contTotalBytes / documents.length);
  } else if (/\/discuss$/.test(location.href)) {
    function standardDeviation(numbers) {
      var total = 0;
      for (var i = 0; i < numbers.length; i++) {
        total += numbers[i];
      }
      var avg = total / numbers.length;
      var temp1 = 0;
      for (var i = 0; i < numbers.length; i++) {
        temp1 += Math.pow(numbers[i] - avg, 2);
      }
      temp1 /= numbers.length;
      return Math.sqrt(temp1);
    }
    var rows = document.querySelectorAll('table tr');
    var docuAndTalks = {};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row.querySelectorAll('a').length == 0) continue;
      var docuNow = rows[i].querySelector('a').getAttribute('href');
      docuNow = /^\/topic\/([0-9]+)(?:#[0-9]+|)/.exec(docuNow)[1];
      if (docuAndTalks[docuNow]) {
        docuAndTalks[docuNow]++;
      } else {
        docuAndTalks[docuNow] = 1;
      }
    }
    var totalTalks = 0,
      avgTalks = 0,
      discussCount = 0,
      Talks = [];
    for (var i in docuAndTalks) {
      totalTalks += docuAndTalks[i];
      Talks.push(docuAndTalks[i]);
    }
    discussCount = Object.keys(docuAndTalks).length;
    avgTalks = totalTalks / discussCount;
    p.innerHTML = '총 발언 수 : ' + totalTalks + '<br>참여한 토론 수 : ' + discussCount + '<br>한 토론당 평균 발언 수 : ' + avgTalks + '<br>한 토론당 발언 수 표준편차 : ' + standardDeviation(Talks);
  } else {
    delete p;
  }
  if (typeof p !== 'undefined') document.querySelector("h1.title").parentNode.insertBefore(p, document.querySelector("h1.title").nextSibling);
} else if (ENV.IsDiff){
  setTimeout(function(){
  try{
  var diffTitle = document.querySelector('#diffoutput thead th.texttitle');
  if(diffTitle == null) return;
  var baseUri = ENV.IsSSL ? "https://namu.wiki" : "http://no-ssl.namu.wiki";
  var newDifftitle = '<span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={2}&rev={3}">(r{2} vs r{3})</a></span> <a href="{0}/w/{1}?rev={3}" title="r{3} 버전 보기">r{3}</a> vs. <a href="{0}/w/{1}?rev={4}" title="r{4} 버전 보기">r{4}</a> <span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={4}&rev={5}">(r{4} vs r{5})</a></span> <span style="font-weight: lighter;"><a href="{0}/history/{1}">(이 문서의 역사)</a></span>'.format(
    baseUri /*{0}*/, ENV.docTitle /*{1}*/,ENV.beforeRev-1 /*{2}*/,ENV.beforeRev /*{3}*/,ENV.afterRev /*{4}*/,ENV.afterRev+1 /*{5}*/
  );
  diffTitle.innerHTML = newDifftitle;
} catch(err){
  alert(err.message+'\n'+err.stack);
}
},500);
}
if (Watcher.onoff())
  Watcher.runWorker();
