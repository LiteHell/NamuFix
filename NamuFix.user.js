// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     INDEV
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @run-at      document-end
// ==/UserScript==

GM_addStyle("em{font-style: italic;}");
GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/NamuFix.css",
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
ENV.IsEditing = /https?:\/\/namu\.wiki\/edit\/(.+?)/.test(location.href);
ENV.Discussing = /https?:\/\/namu\.wiki\/topic\/(.+?)/.test(location.href);
if (document.querySelector("input[name=section]"))
  ENV.section = document.querySelector("input[name=section]").value;
if (ENV.IsEditing)
  ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
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
    for (var i in this) {
      if (sets.indexOf('SET_' + i) == -1 && discards.indexOf(i) == -1) {
        delete this[i];
      }
    }
  };
};
SET.load();

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
        // imgur Client ID : 60a43baebed658a
        var file = evt.target.files[0];
        if (file) {
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
                } else {
                  var deleteLink = 'http://imgur.com/delete/' + res["data"]["deletehash"];
                  var imageDirectLink = res["data"]["link"];
                  prompt('삭제 링크입니다. \'\'\'반드시 지금\'\'\' 복사해서 어딘가에 메모해두세요.', deleteLink);
                  TextProc.selectionText(TextProc.selectionText() + '\n' + imageDirectLink);
                }
              }
            });
            document.body.removeChild(elm);
          };
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
        if (nOu(SET.tempsaves)) {
          SET.tempsaves = {};
          SET.save();
        }
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
      /* tempsaveDropdown.button('<span class="ion-gear-a"></span>', '전역 임시저장 관리자').click(function() {
        alert('구현예정');
      }); */
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
      if (nOu(SET.recentlyUsedTemplates)) {
        SET.recentlyUsedTemplates = [];
        SET.save();
      }
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
    // Grammar Checker
    Designer.button('<span class="ion-checkmark-round" style="color:gold;"></span>').hoverMessage('멍청한 문법 검사기').click(function() {
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
      for (var i = 0; i < markupPatterns.length; i++) {
        while (plain.match(markupPatterns[i]) != null) {
          plain = plain.replace(markupPatterns[i], '$1');
        }
      }

      // 위키백과 [[사용자:Nike787/일반인이 많이 틀리는 맞춤법]]
      var pattern1 = /(웬지|왠[^지])/;
      pattern1.message = '‘왠’은 단독으로 쓰일 수 없고, ‘왜인지’의 약어인 ‘왠지’의 형식으로 쓰여야 합니다. 반면 ‘웬’은 단독으로 쓰여야 합니다.';
      var pattern2 = /(됐다|돼었다|돼고|됀다|돼죠|돼지[\.\?])/;
      pattern2.message = '이러한 맞춤법 실수는 "되다" 동사를 "하다"로 바꾸어 "하"가 들어가야 할 부분에 "되"를 넣고 "해"가 들어가야 할 부분에 "돼"를 넣는 식으로 고칠 수 있습니다.';
      // 데와 대 -> 정규표현식으로 불가능하므로 생략.
      var pattern3 = /어의없/;
      pattern3.message = '"그 어이없는 놈"할때 어이의 의미라면 어의가 아니라 어이로 써야합니다. 다만 임금을 치료하던 조선시대 관직, 임금님이 입는 옷, 말의 뜻 이 세가지 의미 중 하나를 의도한경우 맞습니다'
      var pattern4 = /않\s?(했|된)|/;
      pattern4.message = '"안"은 "아니"의 축약형이고, "않"은 "아니하"의 축약형입니다.';
      var pattern5 = /꺽[(었다)다(습니다)(는구나)(었구나)(어라)게자고(으며)어임음]+[\.\?,]?/;
      pattern4.message = '"꺽다"가 아니라 "꺾다"가 옳습니다.';
      var pattern6 = /깍[(었다)(았다)다(습니다)(는구나)(었구나)(았구나)(어라)(아라)자고(으며)어아임음]+[\.\?,]?/;
      pattern5.message = '"깍다"가 아니라 "깎다"가 옳습니다.';
      var pattern7 = /불리우다|불리운/;
      pattern7.message = '어떤 경우에도 "불리다"가 옳고 "불리우다"는 틀립니다.';
      var pattern8 = /왜숙모/;
      pattern8.message = '외숙모, 설마 이걸...';
      var pattern9 = /낮|낳|났|낫|나/;
      pattern9.careful = true;
      pattern9.message = '"낳다": 애기를 "낳다"\n"낮다":저 산의 높이는 "낮다"\n"났다":고도리가 "났다"\n"낫다":아무래도 사람 살기엔 겨울보다 여름이 낫다.';
      var pattern10 = /아만자/;
      pattern10.message = '암환자, 설마 이걸....';
      var pattern11 = /[신실]뢰지만/;
      pattern11.message = '실례지만, 설마 이걸....';
      var pattern12 = /사생활치매/;
      pattern12.message = '사생활침해, 설마 이걸....';
      var pattern13 = /날으[는다]/;
      pattern13.message = '옳은 표기 : (하늘을 )나는/날다';
      var pattern14 = /되어[(지다)진]/;
      pattern14.message = '"되다"가 옳습니다';
      var pattern15 = /들어[(나다)난]/;
      pattern15.message = '"드러나다"가 옳습니다.';
      var pattern16 = /몇\s?일/;
      pattern16.message = '며칠이 옳은 표기입니다.';

      // 백괴사전 [[도움말:헷갈리는_한국어]]
      var pattern18 = /[\s]밖에/;
      pattern18.message = '"밖에"는 붙여씁니다.';

      var pattern17 = /갯수|그닥|금새|기달리다|깨끗히|네모낳다|눈꼽|당췌|덮히다|돌맹이|뒷처리|뒷태|떄|말야|몇\s?일|배[끼낀]|모[(자르)(잘)]|부숴|살고기|삼가[(하니)(하여)해(하였)(했)하]|서슴치|설겆이|설레[이여였]|실[다어(으니)었]|쓰여|씌여|애시당초|어떻|왜래어|왔다리 갔다리|월셋방|어짜피|여지껏|역활|윳|일일히|잘르다|재털이|절대절명|주구창창|줏[(으니)어었다]|질르|청천병력|촛점|통채|폐쇠|폭팔|풍지박산|풍지박살|홀홀달신|회손/;
      pattern17.message = '백괴사전의 <a href="http://uncyclopedia.kr/wiki/%EB%8F%84%EC%9B%80%EB%A7%90:%ED%97%B7%EA%B0%88%EB%A6%AC%EB%8A%94_%ED%95%9C%EA%B5%AD%EC%96%B4">도움말:헷갈리는 한국어</a> 문서를 참고하세요.'

      var pattern18 = /어드저스트|어드밴스드|엔젤|앤절|앵글부츠|밧데리|브릿지|케익|케잌|크레딧|데미지|데자부|데자뷰|앳자|플룻|럭키|메세지|네비게이션|판넬|로보트|소세지|타겟/;
      pattern18.message = '잘못된 외래어 표기가 존재합니다. 백괴사전의 <a href="http://uncyclopedia.kr/wiki/%EB%8F%84%EC%9B%80%EB%A7%90:%ED%97%B7%EA%B0%88%EB%A6%AC%EB%8A%94_%ED%95%9C%EA%B5%AD%EC%96%B4">도움말:헷갈리는 한국어</a> 문서 중 <i>외래어 표기</i> 문단을 참고하세요.';

      var messages = document.createElement('ul');
      var patterns = [pattern1, pattern2, pattern3, pattern4, pattern5, pattern6, pattern7, pattern8, pattern9, pattern10, pattern11, pattern12, pattern13, pattern14, pattern15, pattern16, pattern17, pattern18];
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].test(plain)) {
          var message = document.createElement('li');
          message.innerHTML = patterns[i].message;
          if(pattern[i].careful)
            message.style.fontStyle='italic';
          messages.appendChild(message);
        }
      }
      var win = NEWindow();
      win.title('검사 결과');
      win.content(function(el) {
        el.innerHTML = '<p>검사에 완료했습니다. 이 검사기는 멍청하므로 진짜 제대로 검사할거면 <a href="http://speller.cs.pusan.ac.kr/">부산대 한국어 맞춤법/문법 검사기</a>를 사용하세요.</p>'
        el.appendChild(messages);
      })
      win.button('닫기', win.close);
    });

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
  }
}
