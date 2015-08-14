// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     150814.0
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

var ENV = {};
ENV.IsEditing = /^https?:\/\/namu\.wiki\/edit\/(.+?)/.test(location.href);
ENV.Discussing = /^https?:\/\/namu\.wiki\/topic\/([0-9]+?)/.test(location.href);
ENV.IsDocument = /^https?:\/\/namu\.wiki\/w\/(.+)/.test(location.href); //&& document.querySelector('p.wiki-edit-date');
ENV.IsSettings = /^https?:\/\/namu\.wiki\/settings/.test(location.href);
if (document.querySelector("input[name=section]"))
  ENV.section = document.querySelector("input[name=section]").value;
if (ENV.IsEditing)
  ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
else if (ENV.IsDocument)
  ENV.docTitle = document.querySelector("h1.title").innerHTML;
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
  wrapper.style.zIndex = '9999';
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
        if (arguments.length == 1) var r = l;
        var t = this.selectionText();
        if (t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length)) {
          var s = this.selectionStart();
          this.selectionText(t.substring(l.length, t.length - r.length));
          this.select(s, s + t.length - l.length - r.length);
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
      var ExtractYouTubeID = function() {
        // from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[7].length == 11)
          return match[7];
        else
          return null;
      }
      var url = prompt("YouTube 동영상 주소를 입력해주세요.");
      var extracted = ExtractYouTubeID(url);
      TextProc.selectionText(TextProc.selectionText() + '\n' + extracted != null ? '[youtube(' + extracted + ')]' : '\n## YouTube 동영상 ID 추출에 실패하였습니다. 주소를 확인해주세요.');
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
        TextProc.selectionText(TextProc.selectionText() + '\n[Include(틀:지도,position=' + lat + '%2C' + lng + ',zoom=' + zoom + ')]');
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
          divWithscrollbars.style.height = '500px';
          divWithscrollbars.style.overflow = 'scroll';
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
          divWithscrollbars.style.height = '500px';
          divWithscrollbars.style.overflow = 'scroll';
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

    // insertable but non-media functions
    function tableWYSIWYG() { //INDEV
      var win = NEWindow();
      var table = document.createElement("table");
      win.title('표 WYSIWYG 생성');
      win.content(function(el) {
        function newButton(text, func) {
          var btn = document.createElement("button");
          btn.setAttribute("type", "button");
          btn.style.margin = '0';
          btn.innerHTML = text;
          btn.addEventListener("click", func);
          el.appendChild(btn);
        }

        function newRow() {
          var tr = document.createElement("tr");
          table.appendChild(tr);
        }

        function newCellLine() { //옆줄 추가
          var trs = table.getElementsByTagName("tr");
          for (var i = 0; i < trs.length; i++) {
            newCell(i);
          }
        }

        function newCell(r) { // Zero-based
          var tr = table.getElementsByTagName("tr")[r];
          var td = document.createElement("td");
          td.innerHTML = "가나다";
          td.setAttribute("contenteditable", "true");
          td.style.border = "1px solid #9D75D9";
          td.style.padding = '5px 10px';
          td.style.fontSize = '13px';
          /*td.addEventListener('contextmenu', function() {
            return false;
          })
          td.addEventListener('mousedown', function(e) {
            if (e.which == 3) {

            }
          })*/
          tr.appendChild(td);
        }

        function newRowLine() { // 밑줄 추가
          var tr = newRow();
          var lastTr = table.getElementsByTagName("tr").length - 1;
          var tds = table.getElementsByTagName("tr")[0].getElementsByTagName("td");
          var cellsToCreate = 0;
          for (var i = 0; i < tds.length; i++) {
            if (tds[i].getAttribute("colspan") == null)
              cellsToCreate += 1;
            else
              cellsToCreate += Number(tds[i].getAttribute("colspan"));

          }
          for (var i = 0; i < cellsToCreate; i++) {
            newCell(lastTr);
          }
        }

        function lineTag() {
          var p = document.createElement("p");
          p.appendChild(document.createElement("br"));
          return p;
        }
        newButton('새열', newRowLine);
        newButton('새행', newCellLine);
        el.appendChild(lineTag());
        newRow();
        newCellLine();
        newCellLine();
        newRowLine();

        el.appendChild(table)
      });
    }

    // insertable but non-media dropdowns
    //var nminsertableDropdown = Designer.dropdown('<span class="ion-person"></span>').hoverMessage('도우미');
    //nminsertableDropdown.button('<span class="ion-grid"></span>', '표 WYSIWYG').click(tableWYSIWYG);

    // Grammar Checker
    /* Designer.button('<span class="ion-checkmark-round" style="color:gold;"></span>').hoverMessage('멍청한 문법 검사기').click(function() {
      var win = NEWindow();
      win.title('모자른 맞춤법 검사기');
      win.content(function(el) {
        el.innerHTML = '맞춤법 검사가 진행중입니다.\n<span style="color:red;">맞춤법 검사기를 맹신하지 마세요!</span>';
      });
      var plain = TextProc.value();
      var markupPatterns = [
        /^=+(.+?)=+$/,
        /'''(.+?)'''/,
        /''(.+?)''/,
        /{{{#![a-zA-Z0-9]+ (.+)}}}/,
        /~~(.+?)~~/,
        /--(.+?)--/,
        /__(.+?)__/,
        /\^\^(.+?)\^\^/,
        /,,(.+?),,/,
        /{{{+[1-5] (.+?)}}}/,
        /{{{(.+?)}}}/,
        /\[\[.+\|(.+)\]\]/,
        /\[\[(.+)\]\]/,
        /{{\|(.+?)\|}}/,
        /^\s+(?:\*|1\.|A\.|a\.|i\.|I\.) (.+?)/,
        /\[\*.? (.+?)\]\]/,
        /^> (.+?)/,
        /^\s+(.+?)/
      ];
      win.content(function(el) {
        el.innerHTML = '맞춤법 검사가 진행중입니다.(위키 마크업을 제거하는 중)\n<span style="color:red;">맞춤법 검사기를 맹신하지 마세요!</span>';
      });
      for (var i = 0; i < markupPatterns.length; i++) {
        while (plain.match(markupPatterns[i]) != null) {
          plain = plain.replace(markupPatterns[i], '$1');
        }
      }
      win.content(function(el) {
        el.innerHTML = '데이터 전송중.\n<span style="color:red;">맞춤법 검사기를 맹신하지 마세요!</span>';
      });
      var misses = [];
      GM_xmlhttpRequest({
        method: "POST",
        url: "http://58.236.183.101:8080/",
        data: JSON.stringify({
          action: "check",
          data: plain
        }),
        onload: function(res) {
          win.content(function(el) {
            el.innerHTML = '맞춤법 검사가 진행중입니다.(데이터 분석중)\n<span style="color:red;">맞춤법 검사기를 맹신하지 마세요!</span>';
          });
          var lines = JSON.parse(res.responseText).data.split('\n');
          var lineNow = 1;
          var misses = [];
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            console.log(line);
            if (line.trim().length == 0) {
              lineNow++
            }
            if (line.indexOf('#') == 0) {
              var pat = /^# (.+?) ([0-9]+)/;
              var matches = pat.exec(line);
              misses.push({
                type: "none",
                offset: matches[2],
                lineNo: lineNow,
                original: matches[1]
              });
            } else if (line.indexOf('&') == 0) {
              var pat = /^& (.+?) ([0-9]+) ([0-9]+): (.+?)$/;
              var matches = pat.exec(line);
              misses.push({
                type: "miss",
                offset: matches[3],
                // count: matches[2],
                original: matches[1],
                goods: matches[4],
                lineNo: lineNow
              });
            }
            win.content(function(el) {
              el.innerHTML = '맞춤법 검사가 진행중입니다.(데이터 분석중... ' + i + '/' + lines.length + ')\n<span style="color:red;">맞춤법 검사기를 맹신하지 마세요!</span>';
            });
          }

          console.log(JSON.stringify(misses));
          win.content(function(el) {
            el.innerHTML = '<p style="color:red;">맞춤법 검사기를 맹신하지 마세요!</p>';
            var table = document.createElement("table");
            table.innerHTML = '<tr><th>열</th><th>행</th><th>틀림</th><th>비고/제안</th></tr>'
            for (var i = 0; i < misses.length; i++) {
              var miss = misses[i];
              var tr = document.createElement("tr");
              var line = document.createElement("td");
              var offset = document.createElement("td");
              var original = document.createElement("td");
              var goods = document.createElement("td");

              line.innerHTML = miss.lineNo;
              offset.innerHTML = miss.offset;
              original.innerHTML = miss.original;
              goods.innerHTML = miss.type == "miss" ? miss.goods : "사전에 없는 단어?";

              tr.appendChild(line);
              tr.appendChild(offset);
              tr.appendChild(original);
              tr.appendChild(goods);

              table.appendChild(tr);
            }
            var divWithScrolls = document.createElement("div");
            divWithScrolls.style.overflow = 'scroll';
            divWithScrolls.style.maxHeight = '600px';
            divWithScrolls.appendChild(table);
            el.appendChild(divWithScrolls);
          });
          win.button('닫기', win.close);
        }
      });
    }); */

    // set Size
    if (ENV.Discussing)
      rootDiv.style.height = '170px';
    else
      rootDiv.style.height = '600px';

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
  addButton('리다이렉트', function(evt) {
    var redirectFrom = prompt('어느 문서에서 지금 이문서로 리다이렉트?');
    if (redirectFrom != null && redirectFrom.trim().length != 0)
      location.href = 'https://namu.wiki/edit/' + redirectFrom + '?redirectTo=' + ENV.docTitle;
  });
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
      el.innerHTML = '<input type="checkbox" id="enableDw"></input> 문서주시기능 활성화<br>';
      el.querySelector('#enableDw').checked = Watcher.onoff();
      elems['enableDw'] = el.querySelector('#enableDw');
    });
    win.button('저장하지 않고 닫기', win.close);
    win.button('저장하고 닫기', function() {
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
    var colorHash = new ColorHash();
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (message.querySelector('.first-author')) continue;
      if (message.querySelector('[data-nfbeauty]')) continue;
      var a = message.querySelector('.r-head > a');
      var n = a.innerHTML;
      if (a.getAttribute("href").indexOf("/contribution/author") == 0) {
        // 로그인
        n = '!ID!' + n;
      } else {
        // IP
        n = '!IP!' + n;
      }

      var span = document.createElement("span");
      span.style.background = colorHash.hex(n);
      span.style.color = colorHash.hex(n);
      span.innerHTML = '__';
      a.appendChild(span);
      a.dataset.nfbeauty = true;
    }
  }, 200);
}
if (Watcher.onoff())
  Watcher.runWorker();
