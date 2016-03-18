// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://no-ssl.namu.wiki/*
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://issue.namu.wiki/*
// @version     160318.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/master/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @require     https://raw.githubusercontent.com/zenozeng/color-hash/master/dist/color-hash.js
// @require     http://www.xarg.org/download/pnglib.js
// @require     https://raw.githubusercontent.com/stewartlord/identicon.js/master/identicon.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.js
// @require     https://raw.githubusercontent.com/LiteHell/TooSimplePopupLib/master/TooSimplePopupLib.js
// @require     https://raw.githubusercontent.com/kpdecker/jsdiff/49dece07ae3b3e9e2e9a57592f467de3dff1aabc/diff.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_info
// @run-at      document-end
// ==/UserScript==
/*
Copyright (c) 2015 LiteHell

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
if (/^http:\/\/issue\.namu\.wiki/.test(location.href)) {
  location.href = location.href.replace(/^http:\/\//, 'https://');
}

function emReset() {
  if (confirm('정말로 초기화하시겠습니까? 초기화하면 임시저장, 설정, 템플릿 목록.... 등등 모든 것이 초기화됩니다.\n' +
      '오류/버그가 이유라면 초기화하기 전 최신 버전으로의 업데이트를 먼저 시도해주세요.\n\n그래도 초기화하시겠습니까?')) {
    var valKeys = GM_listValues();
    for (var i = 0; i < valKeys.length; i++) {
      GM_deleteValue(valKeys[i]);
    }
    alert('초기화 완료')
  }
}
if (typeof exportFunction !== "undefined") {
  exportFunction(emReset, unsafeWindow, {
    defineAs: "EmergencyReset"
  })
} else if (typeof unsafeWindow !== "undefined") {
  unsafeWindow.EmergencyReset = emReset;
} else {
  window.EmergencyReset = emReset;
}

function insertCSS(url) {
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function(res) {
      GM_addStyle(res.responseText);
    }
  });
}
insertCSS("https://cdn.rawgit.com/LiteHell/NamuFix/83dd14f60070af204b452ec79f2db68acda65cfe/NamuFix.css");
insertCSS("https://raw.githubusercontent.com/LiteHell/TooSimplePopupLib/master/TooSimplePopupLib.css");

function nOu(a) {
  return typeof a === 'undefined' || a == null;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var newstr = this;
    for (var i = 0; i < arguments.length; i++) {
      var b = '{' + i + '}';
      var a = arguments[i];
      while (newstr.indexOf(b) != -1) newstr = newstr.replace(b, a);
    }
    return newstr;
  }
}
// HTML 이스케이프 함수
function encodeHTMLComponent(text) {
  var result = text;
  // http://www.w3schools.com/php/func_string_htmlspecialchars.asp 참고함.
  result = result.replace(/&/gmi, "&amp;");
  result = result.replace(/</gmi, "&lt;");
  result = result.replace(/>/gmi, "&gt;");
  result = result.replace(/'/gmi, "&#039;");
  result = result.replace(/"/gmi, "&quot;");
  return result;
}

function forLoop(array, callback) {
  var index = 0;
  var doNext = function() {
    if (array.length > index) {
      callback(array[index++], doNext, index == array.length - 1);
    }
  }
  doNext();
}

function formatDateTime(t) {
  var d = new Date(t);
  return '{0}년 {1}월 {2}일 {7}요일 {6} {3}시 {4}분 {5}초'.format(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours() - (d.getHours() > 12 ? 12 : 0), d.getMinutes(), d.getSeconds(), d.getHours() > 12 ? '오후' : '오전', (['일', '월', '화', '수', '목', '금', '토'])[d.getDay()]);
}

var hashDictionary = {};

function SHA512(text) {
  if (typeof hashDictionary[text] === 'undefined') {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(text);
    hashDictionary[text] = shaObj.getHash("HEX");
  }
  return hashDictionary[text];
}

function uniqueID() {
  var dt = Date.now();
  var url = location.href;
  var randomized = Math.floor(Math.random() * 48158964189489678525869410);
  return SHA512(String(dt).concat(dt, '\n', url, '\n', String(randomized)));
}

function listenPJAX(callback) {
  // create elements
  var pjaxButton = document.createElement("button");
  var scriptElement = document.createElement("script");

  // configure button
  pjaxButton.style.dispaly = "none";
  pjaxButton.id = "nfFuckingPJAX"
  pjaxButton.addEventListener("click", callback);

  // configure script
  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX").click();})';

  // add elements
  document.body.appendChild(pjaxButton);
  document.head.appendChild(scriptElement);
}



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
  if (nOu(SET.discussIdentiSaturation))
    SET.discussIdentiSaturation = 0.5;
  if (nOu(SET.favorites))
    SET.favorites = [];
  if (nOu(SET.customIdenticons))
    SET.customIdenticons = {};
  if (nOu(SET.hideDeletedWhenDiscussing))
    SET.hideDeletedWhenDiscussing = 0;
  else if (typeof SET.hideDeletedWhenDiscussing !== "Number")
    SET.hideDeletedWhenDiscussing = Number(SET.hideDeletedWhenDiscussing);
  if (nOu(SET.discussAnchorPreviewType))
    SET.discussAnchorPreviewType = 1; // 0 : None, 1 : mouseover, 2 : quote
  else
    SET.discussAnchorPreviewType = Number(SET.discussAnchorPreviewType);
  if (nOu(SET.removeNFQuotesInAnchorPreview))
    SET.removeNFQuotesInAnchorPreview = false;
  SET.save();
}

var nfMenuDivider = document.createElement("div");
(function() {
  nfMenuDivider.className = "dropdown-divider";
  var secondDivider = document.querySelectorAll('.dropdown-divider')[1];
  secondDivider.parentNode.insertBefore(nfMenuDivider, secondDivider);
})();

function addItemToMemberMenu(text, onclick) {
  var menuItem = document.createElement("a");
  menuItem.className = "dropdown-item";
  menuItem.href = "#NothingToLink";
  menuItem.innerHTML = text;
  menuItem.addEventListener('click', onclick);
  nfMenuDivider.parentNode.insertBefore(menuItem, nfMenuDivider.nextSibling);
}

function getVPNGateIPList(callback) {
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://www.vpngate.net/api/iphone/",
    onload: function(res) {
      var lines = res.responseText.split('\n');
      var result = [];
      for (var i = 0; i < lines.length; i++) {
        if (!/^[\*#]/.test(lines[i]))
          result.push(lines[i].split(',')[1]);
      }
      callback(result);
    }
  })
}

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

function makeTabs() {
  var div = document.createElement("div");
  div.className = "nf-tabs";
  div.innerHTML = "<ul></ul>";
  var ul = div.querySelector("ul");
  return {
    tab: function(text) {
      var item = document.createElement("li");
      item.innerHTML = text;
      item.addEventListener('click', function() {
        var selectedTabs = div.querySelectorAll('li.selected');
        for (var i = 0; i < selectedTabs.length; i++) {
          selectedTabs[i].className = selectedTabs[i].className.replace(/selected/mg, '');
        }
        item.className = "selected";
      });
      ul.appendChild(item);
      return {
        click: function(callback) {
          item.addEventListener('click', callback);
          return this;
        },
        selected: function() {
          if (item.className.indexOf('selected') == -1) item.className += ' selected';
          return this;
        }
      };
    },
    get: function() {
      return div;
    }
  };
}

function createDesigner(buttonBar) {
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
    dropdown.style.display = 'none';
    dropdownButton.addEventListener('click', function() {
      var dropdowns = buttonBar.querySelectorAll(".NamaEditor.NEMenuButton > .NamaEditor.NEDropDown");
      for (var i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i] != dropdown) {
          dropdowns[i].style.display = 'none';
          dropdowns[i].parentNode.removeAttribute("hover");
        } else if (dropdown.style.display.trim() == 'none') {
          dropdown.style.display = '';
          dropdownButton.setAttribute("hover", "yes");
        } else {
          dropdown.style.display = 'none';
          dropdownButton.removeAttribute("hover");
        }
      }
    });

    var hr = {
      button: function(iconTxt, txt) {
        var liTag = document.createElement('li');
        liTag.innerHTML = '<span class="NEHeadIcon">' + iconTxt + '</span><span class="NEDescText">' + txt + '</span>'
        liTag.addEventListener('click', function() {
          dropdown.style.display = '';
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
  return Designer;
}

function createTextProcessor(txtarea) {
  var r = {};
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
  return r;
}

function getFile(callback, allowMultiple) {
  if (typeof allowMultiple === "undefined") var allowMultiple = false;
  var elm = document.createElement("input");
  elm.setAttribute("type", "file");
  if (allowMultiple) elm.setAttribute("multiple", "1");
  elm.style.visibility = "hidden";
  elm.setAttribute("accept", "image/*");
  document.body.appendChild(elm);
  elm.addEventListener('change', function(evt) {
    callback(evt.target.files, function() {
      document.body.removeChild(elm);
    })
  });
  elm.click();
}

function mainFunc() {
  // 환경 감지
  var ENV = {};
  ENV.IsSSL = /^https/.test(location.href);
  ENV.IsEditing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/edit\/(.+?)/.test(location.href);
  ENV.Discussing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+?)/.test(location.href);
  ENV.IsDocument = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/w\/(.+)/.test(location.href); //&& document.querySelector('p.wiki-edit-date');
  ENV.IsSettings = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/settings/.test(location.href);
  ENV.IsUserPage = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.href);
  ENV.IsUploadPage = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/Upload$/.test(location.href);
  ENV.IsDiff = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/diff\/.+/.test(location.href);
  ENV.IsLoggedIn = document.querySelectorAll('img.user-img').length == 1;
  if (ENV.IsLoggedIn) {
    ENV.UserName = document.querySelector('div.user-info > div.user-info > div:first-child').textContent.trim();
  }
  if (document.querySelector("input[name=section]"))
    ENV.section = document.querySelector("input[name=section]").value;
  if (document.querySelector("h1.title > a"))
    ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
  else if (document.querySelector("h1.title"))
    ENV.docTitle = document.querySelector("h1.title").innerHTML;
  if (ENV.Discussing) {
    ENV.topicNo = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+)/.exec(location.href)[1];
    ENV.topicTitle = document.querySelector('article > h2').innerHTML;
  }
  if (ENV.IsDiff) {
    //ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
    ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
    ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
  }
  if (nOu(ENV.section))
    ENV.section = -2;
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://api.ipify.org/?format=json",
    onload: function(res) {
      var ip = JSON.parse(res.responseText).ip;
      if (!ENV.IsLoggedIn) ENV.UserName = ip;
      ENV.IPAddress = ip;
    }
  });

  // 설정 초기화
  INITSET();


  // 기부 문구 추가
  if (document.querySelector('footer')) {
    if (document.querySelector('#nf-donation')) return;
    var bitcoinAddress = '1namugv5YiXPdjBx7RoHpWCGuMnjLZEh6';
    var imageDataUrl = "data:image/png;base64,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"
    var footer = document.querySelector('footer');
    var donationDiv = document.createElement("div");
    donationDiv.id = "nf-donation";
    donationDiv.style.textAlign = 'right';
    donationDiv.style.marginTop = '5px';
    donationDiv.innerHTML = ('<img src="{1}" style="height: 40px; width: 116.7px; float:right; display: inline; margin-left: 10px;"></img>' +
      '오늘같은 날 나무위키에 줄 수 있는 특별한 사랑은 무엇일까요? 특별한 사랑이란 잊혀지지 않는 사랑, 그 이름은 기부입니다.<br>' +
      '비트코인 주소 : {0} <a href="#NothingToLink" id="showQR">(QR 코드 확인)</a>').format(bitcoinAddress, imageDataUrl);
    donationDiv.querySelector('#showQR').addEventListener('click', function() {
      var win = TooSimplePopup();
      win.title('QR코드');
      win.content(function(container) {
        container.innerHTML = '<img src="https://file1.namu.wiki/d1/d1fddc88d65dacea0f5622f7a0c768f7f7bc3012e65efd45c9fa07db6d119472.png" style="max-width: calc(100vw - 50px);"></img>';
      });
      win.button('닫기', win.close);
    })
    footer.appendChild(donationDiv);
  }
  if (ENV.IsEditing || ENV.Discussing) {
    if (document.querySelectorAll("textarea").length == 1 && !document.querySelector("textarea").hasAttribute("readonly")) {
      var rootDiv = document.createElement("div");
      if (ENV.IsEditing) {
        // 탭 추가
        var previewTab = document.createElement("div");
        var diffTab = document.createElement("div");
        var initalPreviewTabHTML = '<iframe id="nfPreviewFrame" name="nfPreviewFrame" style="width: 100%; height: 600px; display: block; border: 1px solid black;"></iframe>';
        document.querySelector('textarea').parentNode.insertBefore(previewTab, document.querySelector('textarea').nextSibling);
        document.querySelector('textarea').parentNode.insertBefore(diffTab, document.querySelector('textarea').nextSibling);

        function hideAndShow(no) {
          rootDiv.style.display = no == 0 ? '' : 'none';
          previewTab.style.display = no == 1 ? '' : 'none';
          diffTab.style.display = no == 2 ? '' : "none";
        }
        hideAndShow(0);
        var tabs = makeTabs();
        tabs.tab("편집").selected().click(function() {
          hideAndShow(0);
        });
        tabs.tab("미리보기").click(function() {
          previewTab.innerHTML = initalPreviewTabHTML;
          hideAndShow(1);
          var form = document.querySelector('form#editForm');
          form.setAttribute("method", "POST");
          form.setAttribute("target", "nfPreviewFrame");
          form.setAttribute("action", "/preview/" + ENV.docTitle);
          form.submit();
        });
        tabs.tab("비교").click(function() {
          hideAndShow(2);
          diffTab.innerHTML = '<span style="font-size: 15px;">처리중입니다...</span>';
          var editUrl = 'https://namu.wiki/edit/'.concat(ENV.docTitle, ENV.section != -2 ? '?section='.concat(ENV.section) : '');
          GM_xmlhttpRequest({
            url: editUrl,
            method: "GET",
            onload: function(res) {
              var parser = new DOMParser();
              var doc = parser.parseFromString(res.responseText, "text/html");
              var latestBaseRev = doc.querySelector('input[name="baserev"]').value;
              if (doc.querySelectorAll('textarea').length < 1) {
                diffTab.innerHTML = '<span style="font-size: 15px; color:red;">오류가 발생했습니다.</span>';
                return;
              }
              var remoteWikitext = doc.querySelector('textarea').value;
              var wikitext = document.querySelector("textarea.NamaEditor.NETextarea").value;
              diffTab.innerHTML = '<div style="width: 100%;">' +
                '<div style="width: 100%; background: #006600; color: white; padding: 10px 5px 8px 5px;">' +
                '현재 편집중인 내용은 리버전 r{0}에 기반하고, 현재 최신 버전의 리버전은 r{1}입니다. 삭제된 부분은 <span style="color:red">붉은</span>색으로, 추가된 부분은 <span style="color:green">녹색</span>으로 나타납니다.'.format(document.querySelector('input[name="baserev"]').value, latestBaseRev) +
                '</div>' +
                '<div style="background: #001400; padding: 10px 5px 10px 5px; color: white; width: 100%; margin: 0px; max-height: 600px; overflow: scroll;" id="diffResult">' +
                '</div>' +
                '</div>' +
                '<style>' +
                '.added, .removed, .normal {display: block;}' +
                '.added {background: darkgreen; color: green;}' +
                '.removed {background: darkred; color: red;}' +
                '.normal {background: transparent; color: white;}' +
                '</style>';
              var result = diffTab.querySelector('#diffResult');
              var diff = JsDiff.diffLines(encodeHTMLComponent(remoteWikitext), encodeHTMLComponent(wikitext));
              diff.forEach(function(item) {
                var span = document.createElement("span");
                span.className = item.added ? 'added' : item.removed ? 'removed' : 'normal';
                span.innerHTML = item.value.replace(/\n/mg, '<br>');
                result.appendChild(span);
              });
            }
          });
        });
        document.querySelector("#editForm").insertBefore(tabs.get(), document.querySelector("#editForm").firstChild);
      }

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
      var Designer = createDesigner(buttonBar);

      // Functions To Process
      var TextProc = createTextProcessor(txtarea);

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
        var w = window.TooSimplePopup();
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
        getFile(function(files, finish) {
          if (files.length < 0) {
            alert('선택된 파일이 없습니다.');
            finish();
            return;
          }
          forLoop(files, function(file, next, isLastItem) {
            var win = TooSimplePopup();
            win.title('Imgur 업로드');
            win.content(function(el) {
              el.innerHTML = '<span id="msg">진행중입니다. 잠시만 기다려주세요....</span><br><br>이미지 삭제 주소는 <a href="https://namu.wiki/settings" target="_blank">NamuFix 설정 페이지</a>를 참고하세요.'
            });

            function setMsg(msg) {
              win.content(function(el) {
                el.querySelector('span#msg').innerHTML = msg;
              });
            }
            // imgur Client ID : 60a43baebed658a
            if (file) {
              setMsg('전송중입니다. 잠시만 기다려주세요.....<br>파일 이름 : ' + file.name);
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
                      win.close();
                    } else {
                      var deleteLink = 'http://imgur.com/delete/' + res["data"]["deletehash"];
                      var imageDirectLink = res["data"]["link"];
                      setMsg('완료 : ' + file.name);
                      SET.load();
                      SET.imgurDeletionLinks.push({
                        name: file.name,
                        imgUrl: imageDirectLink,
                        deleteionUrl: deleteLink,
                        uploadedAt: Date.now()
                      });
                      SET.save();
                      win.close();
                      TextProc.selectionText(TextProc.selectionText() + ' ' + imageDirectLink + ' ');
                    }
                    if (isLastItem) finish();
                    next();
                  }
                });
              };
              setMsg('진행중입니다. 파일을 읽고있습니다....<br>파일 이름 : ' + file.name);
              reader.readAsDataURL(file);
            } else {
              next();
            }
          });
        }, true);
        // imgur Client ID : 60a43baebed658a
      };

      function InsertYouTube() {
        var win = TooSimplePopup();
        win.title('YouTube 동영상 삽입');
        win.content(function(el) {
          el.innerHTML = '<p style="background: cyan; box-shadow: 2px 2px 2px gray; color:white; padding: 8px; border-radius: 3px; margin-bottom: 5px;">YouTube 동영상을 검색하거나 동영상 주소를 입력하여 YouTube 동영상을 삽입할 수 있습니다.</p>' +
            '<p><label for="vidUrl" style="width: 120px; display: inline-block;">YouTube 동영상 주소</label><input type="text" name="vidUrl" id="vidUrl" style="width:620px; max-width: 100vw;"></input><button id="insertUrl">삽입</button></p>' +
            '<hr>' +
            '<div>' +
            '<label for="vidQuery" style="width: 120px; display: inline-block;">검색어</label><input type="text" name="vidQuery" id="vidQuery" style="width:620px; max-width: 100vw;"></input><button id="searchVids">검색</button>' +
            '<div id="results" style="overflow-y: scroll; overflow-x: hidden; width: 820px; max-width: 100vw; height: 400px; max-height: calc(100vh - 300px);"><span style="color:red">검색 결과가 없습니다.</span></div>' +
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
                    '<div style="position: relative; display: inline-block; margin-left: 5px; overflow: hidden; width: 670px; max-width: 100vw;">' +
                    '<span style="font-weight: bold; font-size: 12pt; margin-bottom: 3px;">' + vidNow.snippet.title + '</span><button name="insertThis" class="moreFlat">삽입</button><button name="preview" class="moreFlat">미리보기</button><br><span style="font-size:10pt;">' + vidNow.snippet.description + '</span>' +
                    '</div>';
                  li.querySelector('[name="preview"]').parentNode.dataset.videoId = vidNow.id.videoId;
                  li.querySelector('[name="preview"]').addEventListener('click', function(evt) {
                    var previewWin = TooSimplePopup();
                    previewWin.title('미리보기');
                    previewWin.content(function(el) {
                      var iframe = document.createElement("iframe");
                      iframe.setAttribute("frameborder", "0");
                      iframe.setAttribute("src", "//www.youtube.com/embed/" + evt.target.parentNode.dataset.videoId);
                      iframe.style.height = "360px";
                      iframe.style.width = "640px";
                      iframe.style.maxWidth = "100vw";
                      iframe.style.maxHeight = "calc(100vh - 80px)"
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
        var win = TooSimplePopup();
        win.title("지도 삽입");
        win.content(function(el) {
          var mapDiv = document.createElement("div");
          mapDiv.id = "NFMapDiv";
          mapDiv.style.maxHeight = "calc(100vh - 100px)";
          mapDiv.style.maxWidth = "100vw";
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
          TextProc.selectionText(TextProc.selectionText() + '{{{#!html <iframe src="//videofarm.daum.net/controller/video/viewer/Video.html?vid=' + vurl.replace(pattern2, '$1') + '&play_loc=undefined&alert=true" style="max-height: 100%; max-width:100%;" frameborder=\'0\' scrolling=\'0\' width=\'640px\' height=\'360px\'></iframe>}}}');
        }
      };
      // Add Insertable Things
      var insertablesDropDown = Designer.dropdown('<span class="ion-paperclip"></span>').hoverMessage('삽입 가능한 미디어');
      insertablesDropDown.button('<span class="ion-social-youtube" style="color:red;"></span>', 'YouTube 동영상').click(InsertYouTube);
      insertablesDropDown.button('<span class="ion-map"></span>', '지도').click(MapMacro);
      insertablesDropDown.button('<span class="ion-ios-play-outline" style="color: Aqua;"></span>', '다음 TV팟 동영상').click(DaumTVPotMarkUp);

      Designer.button('<span class="ion-ios-timer-outline"></span>').hoverMessage('아카이브하고 외부링크 삽입').click(function() {
        var win = TooSimplePopup();
        win.title("아카이브 한후 외부링크 삽입");
        var linkTo = "",
          linkText = "",
          WayBack = false,
          WayBack = false,
          WayBackAsMobile = false,
          archiveIs = false,
          archiveLinks = [];
        var refresh;
        win.content(function(container) {
          container.innerHTML = '<h1 style="margin: 0px 0px 5px 0px; font-size: 20px;">링크할 곳(외부링크)</h1>' +
            '<style>#linkTo, #visibleOutput {position: absolute; left: 120px;}</style>' +
            '<label>링크할 대상</label> <input type="text" id="linkTo" placeholder="e.g. http://www.naver.com" /><br>' +
            '<label>표시할 텍스트 (출력)</label> <input type="text" id="visibleOutput" placeholder="e.g. 구글" /><br>' +
            '<h1 style="margin: 5px 0px 5px 0px; font-size: 20px;">아카이브</h1>' +
            '<strong>참고</strong> : 동일한 주소의 아카이브를 자주 하다 보면 아까 했던 아카이브가 또 나올 수도 있습니다, 이런 경우엔 잠시 몇분정도 기다렸다가 하시면 됩니다.<br>' +
            '<strong>참고</strong> : 기존의 아카이브들은 무시됩니다.<br>' +
            '<strong style="color:red;">주의</strong> : 불안정한 기능입니다. 버그에 주의하세요.<br>' +
            '<input type="checkbox" id="WayBack" /> <label><a href="https://archive.org/web/" target="_blank">WayBack Machine</a>으로 아카이브</label>(<input type="checkbox" id="WayBackMobi" /> 모바일 버전으로)<br>' +
            '<input type="checkbox" id="archiveIs" /> <label><a href="https://archive.is/" target="_blank" checked>archive.is</a>에서 아카이브</label>';
          refresh = function() {
            linkTo = container.querySelector('#linkTo').value;
            linkText = container.querySelector('#visibleOutput').value;
            WayBack = container.querySelector('#WayBack').checked;
            WayBackAsMobile = container.querySelector('#WayBackMobi').checked;
            archiveIs = container.querySelector('#archiveIs').checked;
          }
        });
        win.button("박제/삽입", function() {
          var waitwin = TooSimplePopup();
          waitwin.title('박제중....');
          refresh();
          if (linkTo.indexOf('http://') != 0 && linkTo.indexOf('https://') != 0) {
            alert('http:// 또는 https://로 시작하는 외부링크가 아닙니다!');
          }
          waitwin.content(function(container) {
            container.innerHTML = '박제중입니다....'
          });

          function finishLinking() {
            var link = '[[' + linkTo + '|링크]]';
            if (archiveLinks.length != 0) {
              link += '(';
              for (var i = 0; i < archiveLinks.length; i++) {
                link += '[[' + archiveLinks[i] + '|아카이브' + (i + 1) + ']]';
                if (i != archiveLinks.length - 1) link += ',';
              }
              link += ')';
            }
            TextProc.selectionText(link + TextProc.selectionText());
            waitwin.close();
            win.close();
          }

          function archiveOne() {
            var archiveType;
            if (WayBack) {
              archiveType = 'wb';
              WayBack = false;
            } else if (archiveIs) {
              archiveType = 'ai';
              archiveIs = false;
            } else {
              finishLinking();
              return;
            }
            var r = {};
            if (archiveType == 'wb') {
              // 'http://web.archive.org/save/'
              // 1 -> Mobile Agent
              r.method = "GET";
              r.url = "http://web.archive.org/save/" + linkTo;
              if (WayBackAsMobile) {
                r.headers = {};
                r.headers["User-Agent"] = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16";
              }
              r.onload = function(res) {
                if (res.status == 403) {
                  alert('오류가 발생했습니다. 크롤링이 금지된 사이트일 수도 있습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                } else if (res.status != 200) {
                  alert('알 수 없는 오류가 발생했습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                }
                var matches = /var redirUrl = \"(.+?)\";/.exec(res.responseText);
                if (matches == null) {
                  alert('아카이브 주소를 얻는 데 실패했습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                }
                var archiveUrl = 'http://web.archive.org' + matches[1];
                archiveLinks.push(archiveUrl);
                setTimeout(archiveOne, 50);
              };
            } else if (archiveType == 'ai') {
              // 'http://archive.is/submit/'
              r.method = "POST";
              r.url = "https://archive.is/submit/";
              r.headers = {};
              r.headers["Content-Type"] = "application/x-www-form-urlencoded";
              r.data = "anyway=1&url=" + encodeURIComponent(linkTo);
              r.onload = function(res) {
                var matches = /document\.location\.replace\("(.+?)"\)/.exec(res.responseText);
                if (matches == null) matches = /<meta property="og:url" content="(.+?)"/.exec(res.responseText);
                if (matches == null) {
                  alert('아카이브 주소를 얻는 데 실패했습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                }
                var archiveUrl = matches[1];
                archiveLinks.push(archiveUrl);
                setTimeout(archiveOne, 50);
              }
            }
            GM_xmlhttpRequest(r);
          }
          archiveOne();
        });
        win.button("닫기", win.close);
      });
      Designer.button('<span class="ion-code"></span>').hoverMessage("코드 예쁘게 삽입").click(function() {
        var win = TooSimplePopup();
        win.title("코드 예쁘게 해서 삽입");
        win.content(function(container) {
          var textarea = document.createElement("textarea");
          textarea.style.maxWidth = "100vw";
          textarea.style.maxHeight = "calc(100vh - 150px)";
          textarea.style.width = "400px";
          textarea.style.height = "400px";
          textarea.style.display = "block";
          textarea.id = "nfCodeToBeautify";
          var langs = document.createElement("select");
          langs.innerHTML = '<option value="abap">ABAP</option>' +
            '<option value="as">ActionScript</option>' +
            '<option value="as3">ActionScript 3</option>' +
            '<option value="ada">Ada</option>' +
            '<option value="antlr">ANTLR</option>' +
            '<option value="antlr-as">ANTLR With ActionScript Target</option>' +
            '<option value="antlr-csharp">ANTLR With C# Target</option>' +
            '<option value="antlr-cpp">ANTLR With CPP Target</option>' +
            '<option value="antlr-java">ANTLR With Java Target</option>' +
            '<option value="antlr-objc">ANTLR With ObjectiveC Target</option>' +
            '<option value="antlr-perl">ANTLR With Perl Target</option>' +
            '<option value="antlr-python">ANTLR With Python Target</option>' +
            '<option value="antlr-ruby">ANTLR With Ruby Target</option>' +
            '<option value="apacheconf">ApacheConf</option>' +
            '<option value="applescript">AppleScript</option>' +
            '<option value="aspectj">AspectJ</option>' +
            '<option value="aspx-cs">aspx-cs</option>' +
            '<option value="aspx-vb">aspx-vb</option>' +
            '<option value="asy">Asymptote</option>' +
            '<option value="ahk">autohotkey</option>' +
            '<option value="autoit">AutoIt</option>' +
            '<option value="awk">Awk</option>' +
            '<option value="basemake">Base Makefile</option>' +
            '<option value="bash">Bash</option>' +
            '<option value="console">Bash Session</option>' +
            '<option value="bat">Batchfile</option>' +
            '<option value="bbcode">BBCode</option>' +
            '<option value="befunge">Befunge</option>' +
            '<option value="blitzmax">BlitzMax</option>' +
            '<option value="boo">Boo</option>' +
            '<option value="brainfuck">Brainfuck</option>' +
            '<option value="bro">Bro</option>' +
            '<option value="bugs">BUGS</option>' +
            '<option value="c">C</option>' +
            '<option value="csharp">C#</option>' +
            '<option value="cpp">C++</option>' +
            '<option value="c-objdump">c-objdump</option>' +
            '<option value="ca65">ca65</option>' +
            '<option value="cbmbas">CBM BASIC V2</option>' +
            '<option value="ceylon">Ceylon</option>' +
            '<option value="cfengine3">CFEngine3</option>' +
            '<option value="cfs">cfstatement</option>' +
            '<option value="cheetah">Cheetah</option>' +
            '<option value="clojure">Clojure</option>' +
            '<option value="cmake">CMake</option>' +
            '<option value="cobol">COBOL</option>' +
            '<option value="cobolfree">COBOLFree</option>' +
            '<option value="coffee-script">CoffeeScript</option>' +
            '<option value="cfm">Coldfusion HTML</option>' +
            '<option value="common-lisp">Common Lisp</option>' +
            '<option value="coq">Coq</option>' +
            '<option value="cpp-objdump">cpp-objdump</option>' +
            '<option value="croc">Croc</option>' +
            '<option value="css">CSS</option>' +
            '<option value="css+django">CSS+Django/Jinja</option>' +
            '<option value="css+genshitext">CSS+Genshi Text</option>' +
            '<option value="css+lasso">CSS+Lasso</option>' +
            '<option value="css+mako">CSS+Mako</option>' +
            '<option value="css+myghty">CSS+Myghty</option>' +
            '<option value="css+php">CSS+PHP</option>' +
            '<option value="css+erb">CSS+Ruby</option>' +
            '<option value="css+smarty">CSS+Smarty</option>' +
            '<option value="cuda">CUDA</option>' +
            '<option value="cython">Cython</option>' +
            '<option value="d">D</option>' +
            '<option value="d-objdump">d-objdump</option>' +
            '<option value="dpatch">Darcs Patch</option>' +
            '<option value="dart">Dart</option>' +
            '<option value="control">Debian Control file</option>' +
            '<option value="sourceslist">Debian Sourcelist</option>' +
            '<option value="delphi">Delphi</option>' +
            '<option value="dg">dg</option>' +
            '<option value="diff">Diff</option>' +
            '<option value="django">Django/Jinja</option>' +
            '<option value="dtd">DTD</option>' +
            '<option value="duel">Duel</option>' +
            '<option value="dylan">Dylan</option>' +
            '<option value="dylan-console">Dylan session</option>' +
            '<option value="dylan-lid">DylanLID</option>' +
            '<option value="ec">eC</option>' +
            '<option value="ecl">ECL</option>' +
            '<option value="elixir">Elixir</option>' +
            '<option value="iex">Elixir iex session</option>' +
            '<option value="ragel-em">Embedded Ragel</option>' +
            '<option value="erb">ERB</option>' +
            '<option value="erlang">Erlang</option>' +
            '<option value="erl">Erlang erl session</option>' +
            '<option value="evoque">Evoque</option>' +
            '<option value="factor">Factor</option>' +
            '<option value="fancy">Fancy</option>' +
            '<option value="fan">Fantom</option>' +
            '<option value="felix">Felix</option>' +
            '<option value="fortran">Fortran</option>' +
            '<option value="Clipper">FoxPro</option>' +
            '<option value="fsharp">FSharp</option>' +
            '<option value="gas">GAS</option>' +
            '<option value="genshi">Genshi</option>' +
            '<option value="genshitext">Genshi Text</option>' +
            '<option value="pot">Gettext Catalog</option>' +
            '<option value="Cucumber">Gherkin</option>' +
            '<option value="glsl">GLSL</option>' +
            '<option value="gnuplot">Gnuplot</option>' +
            '<option value="go">Go</option>' +
            '<option value="gooddata-cl">GoodData-CL</option>' +
            '<option value="gosu">Gosu</option>' +
            '<option value="gst">Gosu Template</option>' +
            '<option value="groff">Groff</option>' +
            '<option value="groovy">Groovy</option>' +
            '<option value="haml">Haml</option>' +
            '<option value="haskell">Haskell</option>' +
            '<option value="hx">haXe</option>' +
            '<option value="html">HTML</option>' +
            '<option value="html+cheetah">HTML+Cheetah</option>' +
            '<option value="html+django">HTML+Django/Jinja</option>' +
            '<option value="html+evoque">HTML+Evoque</option>' +
            '<option value="html+genshi">HTML+Genshi</option>' +
            '<option value="html+lasso">HTML+Lasso</option>' +
            '<option value="html+mako">HTML+Mako</option>' +
            '<option value="html+myghty">HTML+Myghty</option>' +
            '<option value="html+php">HTML+PHP</option>' +
            '<option value="html+smarty">HTML+Smarty</option>' +
            '<option value="html+velocity">HTML+Velocity</option>' +
            '<option value="http">HTTP</option>' +
            '<option value="haxeml">Hxml</option>' +
            '<option value="hybris">Hybris</option>' +
            '<option value="idl">IDL</option>' +
            '<option value="ini">INI</option>' +
            '<option value="io">Io</option>' +
            '<option value="ioke">Ioke</option>' +
            '<option value="irc">IRC logs</option>' +
            '<option value="jade">Jade</option>' +
            '<option value="jags">JAGS</option>' +
            '<option value="java">Java</option>' +
            '<option value="jsp">Java Server Page</option>' +
            '<option value="js">JavaScript</option>' +
            '<option value="js+cheetah">JavaScript+Cheetah</option>' +
            '<option value="js+django">JavaScript+Django/Jinja</option>' +
            '<option value="js+genshitext">JavaScript+Genshi Text</option>' +
            '<option value="js+lasso">JavaScript+Lasso</option>' +
            '<option value="js+mako">JavaScript+Mako</option>' +
            '<option value="js+myghty">JavaScript+Myghty</option>' +
            '<option value="js+php">JavaScript+PHP</option>' +
            '<option value="js+erb">JavaScript+Ruby</option>' +
            '<option value="js+smarty">JavaScript+Smarty</option>' +
            '<option value="json">JSON</option>' +
            '<option value="julia">Julia</option>' +
            '<option value="jlcon">Julia console</option>' +
            '<option value="kconfig">Kconfig</option>' +
            '<option value="koka">Koka</option>' +
            '<option value="kotlin">Kotlin</option>' +
            '<option value="lasso">Lasso</option>' +
            '<option value="lighty">Lighttpd configuration file</option>' +
            '<option value="lhs">Literate Haskell</option>' +
            '<option value="live-script">LiveScript</option>' +
            '<option value="llvm">LLVM</option>' +
            '<option value="logos">Logos</option>' +
            '<option value="logtalk">Logtalk</option>' +
            '<option value="lua">Lua</option>' +
            '<option value="make">Makefile</option>' +
            '<option value="mako">Mako</option>' +
            '<option value="maql">MAQL</option>' +
            '<option value="mason">Mason</option>' +
            '<option value="matlab">Matlab</option>' +
            '<option value="matlabsession">Matlab session</option>' +
            '<option value="minid">MiniD</option>' +
            '<option value="modelica">Modelica</option>' +
            '<option value="modula2">Modula-2</option>' +
            '<option value="trac-wiki">MoinMoin/Trac Wiki markup</option>' +
            '<option value="monkey">Monkey</option>' +
            '<option value="moocode">MOOCode</option>' +
            '<option value="moon">MoonScript</option>' +
            '<option value="mscgen">Mscgen</option>' +
            '<option value="mupad">MuPAD</option>' +
            '<option value="mxml">MXML</option>' +
            '<option value="myghty">Myghty</option>' +
            '<option value="mysql">MySQL</option>' +
            '<option value="nasm">NASM</option>' +
            '<option value="nemerle">Nemerle</option>' +
            '<option value="newlisp">NewLisp</option>' +
            '<option value="newspeak">Newspeak</option>' +
            '<option value="nginx">Nginx configuration file</option>' +
            '<option value="nimrod">Nimrod</option>' +
            '<option value="nsis">NSIS</option>' +
            '<option value="numpy">NumPy</option>' +
            '<option value="objdump">objdump</option>' +
            '<option value="objective-c">Objective-C</option>' +
            '<option value="objective-c++">Objective-C++</option>' +
            '<option value="objective-j">Objective-J</option>' +
            '<option value="ocaml">OCaml</option>' +
            '<option value="octave">Octave</option>' +
            '<option value="ooc">Ooc</option>' +
            '<option value="opa">Opa</option>' +
            '<option value="openedge">OpenEdge ABL</option>' +
            '<option value="perl">Perl</option>' +
            '<option value="php">PHP</option>' +
            '<option value="plpgsql">PL/pgSQL</option>' +
            '<option value="psql">PostgreSQL console (psql)</option>' +
            '<option value="postgresql">PostgreSQL SQL dialect</option>' +
            '<option value="postscript">PostScript</option>' +
            '<option value="pov">POVRay</option>' +
            '<option value="powershell">PowerShell</option>' +
            '<option value="prolog">Prolog</option>' +
            '<option value="properties">Properties</option>' +
            '<option value="protobuf">Protocol Buffer</option>' +
            '<option value="puppet">Puppet</option>' +
            '<option value="pypylog">PyPy Log</option>' +
            '<option selected="selected" value="python">Python</option>' +
            '<option value="python3">Python 3</option>' +
            '<option value="py3tb">Python 3.0 Traceback</option>' +
            '<option value="pycon">Python console session</option>' +
            '<option value="pytb">Python Traceback</option>' +
            '<option value="qml">QML</option>' +
            '<option value="racket">Racket</option>' +
            '<option value="ragel">Ragel</option>' +
            '<option value="ragel-c">Ragel in C Host</option>' +
            '<option value="ragel-cpp">Ragel in CPP Host</option>' +
            '<option value="ragel-d">Ragel in D Host</option>' +
            '<option value="ragel-java">Ragel in Java Host</option>' +
            '<option value="ragel-objc">Ragel in Objective C Host</option>' +
            '<option value="ragel-ruby">Ragel in Ruby Host</option>' +
            '<option value="raw">Raw token data</option>' +
            '<option value="rconsole">RConsole</option>' +
            '<option value="rd">Rd</option>' +
            '<option value="rebol">REBOL</option>' +
            '<option value="redcode">Redcode</option>' +
            '<option value="registry">reg</option>' +
            '<option value="rst">reStructuredText</option>' +
            '<option value="rhtml">RHTML</option>' +
            '<option value="RobotFramework">RobotFramework</option>' +
            '<option value="spec">RPMSpec</option>' +
            '<option value="rb">Ruby</option>' +
            '<option value="rbcon">Ruby irb session</option>' +
            '<option value="rust">Rust</option>' +
            '<option value="splus">S</option>' +
            '<option value="sass">Sass</option>' +
            '<option value="scala">Scala</option>' +
            '<option value="ssp">Scalate Server Page</option>' +
            '<option value="scaml">Scaml</option>' +
            '<option value="scheme">Scheme</option>' +
            '<option value="scilab">Scilab</option>' +
            '<option value="scss">SCSS</option>' +
            '<option value="shell-session">Shell Session</option>' +
            '<option value="smali">Smali</option>' +
            '<option value="smalltalk">Smalltalk</option>' +
            '<option value="smarty">Smarty</option>' +
            '<option value="snobol">Snobol</option>' +
            '<option value="sp">SourcePawn</option>' +
            '<option value="sql">SQL</option>' +
            '<option value="sqlite3">sqlite3con</option>' +
            '<option value="squidconf">SquidConf</option>' +
            '<option value="stan">Stan</option>' +
            '<option value="sml">Standard ML</option>' +
            '<option value="systemverilog">systemverilog</option>' +
            '<option value="tcl">Tcl</option>' +
            '<option value="tcsh">Tcsh</option>' +
            '<option value="tea">Tea</option>' +
            '<option value="tex">TeX</option>' +
            '<option value="text">Text only</option>' +
            '<option value="treetop">Treetop</option>' +
            '<option value="ts">TypeScript</option>' +
            '<option value="urbiscript">UrbiScript</option>' +
            '<option value="vala">Vala</option>' +
            '<option value="vb.net">VB.net</option>' +
            '<option value="velocity">Velocity</option>' +
            '<option value="verilog">verilog</option>' +
            '<option value="vgl">VGL</option>' +
            '<option value="vhdl">vhdl</option>' +
            '<option value="vim">VimL</option>' +
            '<option value="xml">XML</option>' +
            '<option value="xml+cheetah">XML+Cheetah</option>' +
            '<option value="xml+django">XML+Django/Jinja</option>' +
            '<option value="xml+evoque">XML+Evoque</option>' +
            '<option value="xml+lasso">XML+Lasso</option>' +
            '<option value="xml+mako">XML+Mako</option>' +
            '<option value="xml+myghty">XML+Myghty</option>' +
            '<option value="xml+php">XML+PHP</option>' +
            '<option value="xml+erb">XML+Ruby</option>' +
            '<option value="xml+smarty">XML+Smarty</option>' +
            '<option value="xml+velocity">XML+Velocity</option>' +
            '<option value="xquery">XQuery</option>' +
            '<option value="xslt">XSLT</option>' +
            '<option value="xtend">Xtend</option>' +
            '<option value="yaml">YAML</option>';
          langs.id = "nfCodeLanguage";
          var p = document.createElement("p");
          p.innerHTML = 'Powered By. <a href="http://hilite.me/" target="_blank">hilite.me</a>';

          container.appendChild(textarea);
          container.appendChild(langs);
          container.appendChild(p);
        });
        win.button('삽입', function() {
          var postData = "code=".concat(
            encodeURIComponent(document.getElementById("nfCodeToBeautify").value),
            "&lexer=",
            encodeURIComponent(document.getElementById("nfCodeLanguage").value)
          );
          var waiting = TooSimplePopup();
          waiting.title("진행중입니다.");
          waiting.content(function(container) {
            container.innerHTML = "잠시만 기다려주세요...."
          });
          GM_xmlhttpRequest({
            method: "POST",
            url: "http://hilite.me/api",
            data: postData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function(res) {
              TextProc.selectionText(TextProc.selectionText() + "{{{#!html ".concat(res.responseText, "}}}"));
              win.close();
              waiting.close();
            }
          });
        });
        win.button('닫기', win.close);
      });
      /* Designer.button('Σ').hoverMessage('수식 수정/삽입').click(function() {
        function createLaTeXEditor(LTXrootDiv) {
          var buttonBar = document.createElement('div');
          var txtarea = document.createElement('textarea');
          buttonBar.className = 'NamaEditor NEMenu';
          txtarea.className = 'NamaEditor NETextarea'
          txtarea.name = document.querySelector("textarea").name;
          txtarea.style.height = '200px';
          LTXrootDiv.className += ' NamaEditor NERoot';
          LTXrootDiv.appendChild(buttonBar);
          LTXrootDiv.appendChild(txtarea);

          var Designer = createDesigner(buttonBar);
          var TextProc = createTextProcessor(txtarea);
          TextProc.insert = function(txt) {
            this.selectionText(txt + this.selectionText());
          };
          // katext rendering : katex.render("c = \\pm\\sqrt{a^2 + b^2}", element);
          // Greek alphabats
          Designer.button('α').hoverMessage('그리스 문자').click(function() {
            var alphabats = TooSimplePopup();
            alphabats.title('그리스 문자 삽입');
            var romans = [
              'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma',
              'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma',
              'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'varepsilon', 'vartheta', 'varpi', 'varrho', 'varsigma', 'varphi'
            ];
            alphabats.content(function(container) {
              var tableTag = document.createElement("table");
              tableTag.style.margin = '0 auto';
              for (var r = 0; r < 5; r++) {
                var tableRow = document.createElement("tr");
                for (var c = 0; c < (r != 4 ? 8 : 9); c++) {
                  //alert(romans.length + '\n' + r + ' ' + c);
                  var formu = '\\' + romans.pop();
                  var col = document.createElement("td");
                  col.style.padding = '5px';
                  col.dataset.formular = formu;
                  katex.render(formu, col);
                  var childs = col.querySelectorAll('*');
                  for (var i = 0; i < childs.length; i++) {
                    childs[i].setAttribute("data-formular", formu);
                  }
                  col.addEventListener('click', function(evt) {
                    var formu = evt.target.dataset.formular;
                    TextProc.insert(formu);
                    alphabats.close();
                  });
                  col.style.cursor = 'pointer';
                  tableRow.appendChild(col);
                }
                tableTag.appendChild(tableRow);
              }
              container.appendChild(tableTag);
            });
            alphabats.button('닫기', alphabats.close);
          });

          var decoTextDropdown = Designer.dropdown('<span class="ion-wand"></span>').hoverMessage('텍스트 꾸미기');

          function insertFuncClosure(funcName) {
            return function() {
              if (TextProc.selectionText().length == 0) {
                alert('선택한 문자열이 없습니다.');
                TextProc.insert('\\' + funcName + '{\\alpha}');
              } else {
                TextProc.WrapSelection('\\' + funcName + '{', '}');
              }
            }
          }
          decoTextDropdown.button(katex.renderToString('\\sqrt{\\alpha}'), '루트 씌우기').click(insertFuncClosure('sqrt'));
          decoTextDropdown.button(katex.renderToString('\\overline{\\alpha}'), '윗줄').click(insertFuncClosure('overline'));
          return txtarea;
        }
        var fwin = TooSimplePopup();
        fwin.title('LaTeX 수식 수정/삽입');
        fwin.content(function(container) {
          container.innerHTML = '<p><a href="https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX/a196a05989c5d7737ee00036462bb6aeaac6ac23">KaTeX 함수 지원 a196a05판</a>에 포함되어 있는 함수/환경들만 있습니다.</p>' +
            '<p style="margin-top: 10px;"><div id="mainFormular"></div></p>';
          var mf = createLaTeXEditor(container.querySelector('#mainFormular'));

        });
        fwin.button('수정/삽입', function() {
          alert('!');
          fwin.close();
        })
        fwin.button('닫기', function() {
          fwin.close();
        })
      });
      */
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
          var win = TooSimplePopup();
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
          var win = TooSimplePopup();
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
      var aTag = document.createElement("a");
      aTag.className = "btn btn-secondary";
      aTag.setAttribute("role", "button");
      aTag.innerHTML = text;
      aTag.href = "#NothingToLink";
      aTag.addEventListener('click', onclick);
      document.querySelector('.wiki-article-menu > div.btn-group').appendChild(aTag);
    };

    // 리다이렉트 버튼 추가
    addButton('리다이렉트', function(evt) {
      var redirectFrom = prompt('어느 문서에서 지금 이문서로 리다이렉트?');
      if (redirectFrom != null && redirectFrom.trim().length != 0)
        location.href = 'https://namu.wiki/edit/' + redirectFrom + '?redirectTo=' + ENV.docTitle;
    });

    // 리다이렉트로 왔을 시 그 라디이렉트 문서 편집/삭제 링크 추가
    if (document.querySelector('div.top-doc-desc a.document') && document.querySelector('div.top-doc-desc').innerHTML.indexOf('에서 넘어옴') != -1) {
      function insertLinkinto(link, element, label, color) {
        var aTag = document.createElement('a');
        aTag.href = link;
        aTag.innerHTML = label;
        if (typeof color !== 'undefined') aTag.style.color = color;
        element.appendChild(aTag);
      }
      var rdTag = document.querySelector('div.top-doc-desc a.document');
      var rdDocumentName = decodeURIComponent(/\/w\/(.+?)\?noredirect=1/.exec(rdTag.href)[1]);
      var editUrl = '/edit/' + rdDocumentName;
      var deleteUrl = '/delete/' + rdDocumentName;

      var sup = document.createElement("sup");
      rdTag.parentNode.insertBefore(sup, rdTag.nextSibling);
      insertLinkinto(editUrl, sup, '(편집)');
      insertLinkinto(deleteUrl, sup, '(삭제)', 'red');
    }
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
  }

  if (ENV.Discussing) {
    // 아이덴티콘 설정들과 변수들
    var isIcon = SET.discussIdenti == 'icon';
    var isThreadicLike = SET.discussIdenti == 'headBg';
    var isIdenticon = SET.discussIdenti == 'identicon';
    var colorDictionary = {},
      identiconDictionary = {};

    // #[0-9]+ 엥커 미리보기
    function mouseoverPreview() {
      var anchors = document.querySelectorAll('.res .r-body .wiki-link-anchor:not([data-nf-title-processed])');
      for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (!/#[0-9]+$/.test(anchor.href) || anchor.title != ENV.docTitle + '#' + /#([0-9]+)$/.exec(anchor.href)[1]) {
          continue;
        }
        var anchorDirection = document.querySelector('.r-head .num a[id=\'' + /#([0-9]+)$/.exec(anchor.href)[1] + '\']');

        anchor.dataset.target = (anchorDirection) ? anchorDirection.id : "";
        anchor.addEventListener('mouseenter', function(evt) {
          var anchorDirection = document.getElementById(evt.target.dataset.target);
          var obj = {};
          if (anchorDirection == null) {
            obj = {
              talker: "?????????",
              message: "존재하지 않는 메세지입니다.",
              notExists: true
            }
          } else {
            var anchorTarget = anchorDirection.parentNode.parentNode.parentNode;
            obj = {
              talker: anchorTarget.querySelector('.r-head > a').textContent,
              message: anchorTarget.querySelector('.r-body').innerHTML,
              notExists: false
            };
          }
          var elem = document.createElement("div");
          elem.className = 'nfTopicMessage';
          elem.innerHTML = '<div style="font-size: 18px; font-weight: 500; font-family: sans-serif; height: 18px;">{0}</div><div style="margin-top: 15px;">{1}</div>'.format(obj.talker, obj.message);
          elem.style.position = 'absolute';
          elem.style.padding = '10px';
          elem.style.color = 'white';
          elem.style.borderRadius = '4px';
          elem.style.background = obj.notExists ? 'red' : 'black';
          elem.style.zIndex = 3;
          evt.target.appendChild(elem);
          evt.target.title = '';
        });
        anchor.addEventListener('mouseleave', function(evt) {
          //var obj = JSON.parse(evt.target.dataset.targetMessage);
          if (evt.target.querySelector('.nfTopicMessage')) {
            var elemToRemove = evt.target.querySelector('.nfTopicMessage');
            elemToRemove.parentNode.removeChild(elemToRemove);
          }
        });

        anchor.dataset.nfTitleProcessed = true;
      }
      setTimeout(mouseoverPreview, 300);
    }

    function previewAsQuote() {
      var message = document.querySelector('.res:not([data-message-anchor-processed])');
      if (message) {
        message.dataset.messageAnchorProcessed = true;
        var rbody = message.querySelector('.r-body');
        var anchors = rbody.querySelectorAll('.wiki-link-anchor:not([data-nf-title-processed])');
        for (var i = 0; i < anchors.length; i++) {
          var anchor = anchors[i];
          if (!/#[0-9]+$/.test(anchor.href) || anchor.title != ENV.docTitle + '#' + /#([0-9]+)$/.exec(anchor.href)[1]) {
            continue;
          }
          var numbericId = /#([0-9]+)$/.exec(anchor.href)[1];
          var anchorDirection = document.querySelector('.r-head .num a[id=\'' + numbericId + '\']');
          if (anchorDirection == null) continue;
          var anchorTarget = anchorDirection.parentNode.parentNode.parentNode;
          var talker = anchorTarget.querySelector('.r-head > a').textContent,
            message = anchorTarget.querySelector('.r-body').innerHTML,
            talkedAt = anchorTarget.querySelector('.r-head > span.pull-right').textContent;
          var blockquoteId = uniqueID();
          var blockquoteElement = document.createElement("blockquote");
          blockquoteElement.className = "wiki-quote nf-anchor-preview";
          blockquoteElement.innerHTML = message;
          blockquoteElement.id = blockquoteId;
          if (SET.removeNFQuotesInAnchorPreview) {
            var quotesToRemove = blockquoteElement.querySelectorAll('blockquote.nf-anchor-preview');
            for (var i = 0; i < quotesToRemove.length; i++) {
              var quote = quotesToRemove[i];
              quote.parentNode.removeChild(quote);
            }
          }
          blockquoteElement.innerHTML += '<div style="text-align: right; font-style: italic;">--#{1}, {0}, {2}</div>'.format(talker, numbericId, talkedAt);
          rbody.insertBefore(blockquoteElement, rbody.firstChild);

          anchor.dataset.quoteId = blockquoteId;
          anchor.addEventListener('mouseenter', function(evt) {
            var quote = document.getElementById(evt.target.dataset.quoteId);
            quote.style.borderColor = '#CCC #CCC #CCC red !important';
            quote.style.boxShadow = '2px 2px 3px orange';
          });
          anchor.addEventListener('mouseleave', function(evt) {
            var quote = document.getElementById(evt.target.dataset.quoteId);
            quote.style.borderColor = '';
            quote.style.boxShadow = '';
          })
        }
        setTimeout(previewAsQuote, 300);
      }
    }
    var previewFunction;
    switch (SET.discussAnchorPreviewType) {
      case 1:
        previewFunction = mouseoverPreview;
        break;
      case 2:
        GM_addStyle('' +
          'blockquote.nf-anchor-preview{' +
          'border-color: #CCC #CCC #CCC #FF9900 !important;' +
          'background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABTklEQVRoge2ZvYrCQBSF71ulEVLIFIIgC5LOaQRhwcbCKSLbCYtFunmDBTuLEKwEKx9ASOsjWNlYni2WwK5ZV83PTMa9B053IedjJpCcS8RisZ5baaIxG/YhfA+eZ8i+QH84g05SlAofSd9c6Cv2ZVQMIuy0rIfP3OqEj0GsQ2E99KVFuL4fQjYgcN7yPoDjctyAsL97vDzehtjrwHrQaw70ngEYgAEYgAFsA4gR9OaAEwDghMNGYyRqmqkeoIfF7oxLnXcL9CqfqQVAIc49FgBiqMpn+ASe8h2wawawbQawbQaw7f8B4HwrQeR4L0REFKt2AwL/dFvFj9WL6sZ3iVELVazgnQcNaKeDebmKPU00poOu8f1AdzAtvx+oQ+HLX7V9watiWttIwncZINNrboniGAAR0eot+HYaDgJk+vqddBiAiOhj8u42AItlQZ8Z9UiwBSnJVAAAAABJRU5ErkJggg==") !important;' +
          'margin: 0.5em 0px !important;' +
          '}'
        );
        previewFunction = previewAsQuote;
        break;
      default:
        previewFunction = function() {};
    }

    // 아이덴티콘
    function identiconLoop() {
      if (/^https?:\/\/(?:no-ssl\.|)namu\.wiki\/discuss\/(.+?)/.test(location.href)) return;
      var messages = document.querySelectorAll('.res:not([data-nfbeauty])');
      var colorHash = isThreadicLike ? new ColorHash({
        lightness: Number(SET.discussIdentiLightness),
        saturation: Number(SET.discussIdentiSaturation)
      }) : new ColorHash();
      if (isIdenticon && document.querySelector('#nf-identicon-css') == null) {
        var cssContent = 'div.nf-identicon { border: 1px solid #808080; margin: 10px; width: 64px; border: 1px black solid; background: white;} .res[data-nfbeauty] {margin-left: 88px; position: relative; top: -76px;}';
        var styleTag = document.createElement("style");
        styleTag.innerHTML = cssContent;
        styleTag.id = "nf-identicon-css";
        document.head.appendChild(styleTag);
      }
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
        n = SHA512(n);

        var nColor;
        if (typeof colorDictionary[n] === 'undefined') {
          nColor = colorHash.hex(n);
          colorDictionary[n] = nColor;
        } else {
          nColor = colorDictionary[n];
        }

        if (isThreadicLike) {
          message.querySelector('.r-head').style.background = nColor;
          message.querySelector('.r-head').style.color = 'white';
          message.querySelector('.r-head > a').style.color = 'white';
          message.querySelector('.r-head .num a').style.color = 'white';
        } else if (isIcon) {
          var a = message.querySelector('.r-head > a');
          var span = document.createElement("span");
          span.style.background = nColor;
          span.style.color = nColor;
          span.style.marginLeft = '1em';
          span.innerHTML = '__';
          a.parentNode.insertBefore(span, a.nextSibling);
        } else if (isIdenticon) {
          var identicon = document.createElement("div");
          identicon.className = "nf-identicon";
          identicon.innerHTML = '<a><img style="width: 64px; height: 64px;"></img></a>';
          identicon.querySelector("img").dataset.hash = n;
          identicon.querySelector("a").dataset.hash = n;
          identicon.querySelector("a").href = "#NothingToLink";
          identicon.querySelector("a").addEventListener('click', function(evt) {
            SET.load();
            var h = evt.target.dataset.hash;
            if (typeof SET.customIdenticons[h] !== 'undefined') {
              // custom identicon exists
              if (confirm('이미 이미지가 설정되어 있습니다. 제거할까요?')) {
                delete SET.customIdenticons[h];
                SET.save();
              }
            } else {
              if (!confirm('이 아이디 또는 닉네임에 기존 아이덴티콘 대신 다른 이미지를 설정할 수 있습니다.\n설정할까요?')) return;
              // doesn't exists
              getFile(function(files, finish) {
                if (files.length < 0) {
                  alert('선택된 파일이 없습니다.')
                  if (isLastItem) finish();
                  return;
                }
                if (files.length > 1) {
                  alert('한 개의 파일만 선택해주세요.');
                  finish();
                  return;
                }
                var file = files[0];
                if (file) {
                  var reader = new FileReader();
                  reader.onload = function(evt) {
                    SET.customIdenticons[h] = reader.result;
                    SET.save();
                    alert('설정됐습니다.');
                    finish();
                  };
                  reader.readAsDataURL(file);
                }
              });
            }
          });
          if (typeof identiconDictionary[n] === 'undefined' && typeof SET.customIdenticons[n] !== 'undefined')
            identiconDictionary[n] = SET.customIdenticons[n];
          if (typeof identiconDictionary[n] === 'undefined')
            identiconDictionary[n] = "data:image/png;base64," + new Identicon(n, 64).toString();
          var identiconImage = identiconDictionary[n];
          identicon.querySelector('img').src = identiconImage;
          message.parentNode.insertBefore(identicon, message);

          if (message.parentNode.dataset.id != 1) {
            message.parentNode.style.marginTop = '-76px';
            identicon.style.marginTop = '-66px';
          }
        }
        message.querySelector('.r-head > a').dataset.nfbeauty = true;
        message.dataset.nfbeauty = true;
      }
    }

    function discussLoop() {
      // check vpngate
      getVPNGateIPList(function(result) {
        vpngateIP = result;
        checkVPN();
      })

      // attach identicon
      identiconLoop();

      // make previewAsQuote
      previewFunction();
    }
    discussLoop();
    var observer = new MutationObserver(discussLoop);
    observer.observe(document.querySelector("#res-container"), {
      childList: true
    });

    // vpngate IP 확인
    var vpngateIP = [];
    var checkWorker = null;

    function checkVPN() {
      var message = document.querySelector(".res:not([data-vpngate-checked])");
      if (message) {
        message.dataset.vpngateChecked = true;
        var ipLink = message.querySelector(".r-head > a");
        var ipPattern = /\/contribution\/ip\/([a-zA-Z0-9\.:]+)\/(?:document|discuss)$/;
        if (ipPattern.test(ipLink.href)) {
          var ip = ipPattern.exec(ipLink.href)[1];
          if (vpngateIP.indexOf(ip) != -1) {
            var span = document.createElement("span");
            span.style.marginLeft = "1em";
            span.style.color = "red";
            span.innerHTML = "VPNGATE";
            ipLink.parentNode.insertBefore(span, ipLink.nextSibling);
          }
        }
        setTimeout(checkVPN, 200); // recursive Loop
      } else {
        return;
      }
    }

    // 취소선 숨기기
    switch (SET.hideDeletedWhenDiscussing) {
      case 1:
        GM_addStyle('.res .r-body del {display: none;}');
        break;
      case 0.5:
        GM_addStyle('.res .r-body del, .res .r-body del a {color: transparent; background: transparent;} .res .r-body del {border: dotted 1px red;}');
        break;
    }
  } else if (ENV.IsUserPage) {
    function insertBeforeTable(element) {
      var bread = document.querySelector("article > ol.breadcrumb.link-nav");
      bread.parentNode.insertBefore(element, bread);
    }

    function makeHeatTable(times) {
      try {
        // 가공
        var maps = {}; // { day: {0: int, 1: int}, .... }
        var maxValue = 0;
        for (var i = 0; i < 7; i++) {
          maps[i] = {};
          for (var ii = 0; ii < 24; ii++) {
            maps[i][ii] = 0;
          }
        }
        for (var i = 0; i < times.length; i++) {
          var ti = times[i];
          var v = ++maps[ti.getDay()][ti.getHours()];
          if (maxValue < v) maxValue = v;
        }

        // 표 생성
        var table = document.createElement("table");
        var headTr = document.createElement("tr");
        headTr.innerHTML = '<th>요일</th>';
        table.appendChild(headTr);
        var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        for (var i = 0; i < 7; i++) {
          var tr = document.createElement("tr");
          tr.innerHTML += '<th>{0}</th>'.format(dayNames[i]);
          for (var ii = 0; ii < 24; ii++) {
            var td = document.createElement("td");
            td.innerHTML = '&nbsp;'
            td.style.background = 'rgba(61,0,61,{0})'.format(maps[i][ii] / maxValue);
            if (i == 0) {
              function twoDigits(a) {
                var p = String(a);
                return p.length == 1 ? '0' + p : p;
              }
              headTr.innerHTML += '<th>{0}:00 ~ {1}:00</th>'.format(twoDigits(ii), twoDigits(ii + 1))
            }
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
        return table;
      } catch (err) {
        alert(err.message);
      }
    }

    function namuDTParse(v) {
      var time = v.trim().replace(' ', 'T');
      time += '+09:00';
      return new Date(Date.parse(time));
    }
    var p = document.createElement("p");
    p.innerHTML += '<style>.contInfo { border-collapse: collapse; border: 1px solid black; padding: 2px;} #contInfo td {padding: 3px;} #contInfo td:nth-child(2) {border-left: 1px solid black;}</style>';
    var ipPattern = /\/ip\/([a-zA-Z0-9:\.]+)\/(?:document|discuss)(?:#.+|)$/;
    if (ipPattern.test(location.href)) {
      // ip
      // insert CSS if not exists
      if (document.querySelector('link[href$="flag-icon.min.css"]') == null) {
        var link = document.createElement("link");
        link.href = "/css/lib/flag-icon-css/css/flag-icon.min.css";
        link.setAttribute("rel", "stylesheet");
        document.head.appendChild(link);
      }
      // check ip
      var ip = ipPattern.exec(location.href)[1];
      var ipInfo = document.createElement("p");
      ipInfo.innerHTML = '<div style="border: 1px black solid; padding: 2px;">IP 관련 정보를 조회중입니다. 잠시만 기다려주세요.</div>'
      insertBeforeTable(ipInfo);
      getVPNGateIPList(function(result) {
        GM_xmlhttpRequest({
          method: "GET",
          url: "http://ip-api.com/json/{0}".format(ip),
          onload: function(res) {
            var resObj = JSON.parse(res.responseText);
            var country = resObj.countryCode;
            var countryName = resObj.country;
            var isp = resObj.isp;
            ipInfo.innerHTML = (
              "<table class=\"contInfo\">" +
              "<tbody>" +
              "<tr><td>국가</td><td><span class=\"flag-icon flag-icon-{0}\"></span> {1}</td></tr>" + // {0} : cotunry, {1} : countryName
              "<tr><td>통신사</td><td>{2}</td></tr>" +
              "<tr><td>VPNGATE?</td><td>{3}</td></tr>" +
              "</tbody>" +
              '<tfoot>' +
              '<tr><td colspan="2" style="border-top: 1px solid black;">기술적인 한계로, VPNGATE 여부는 "현재 VPNGATE VPN인가?"의 여부이지, "작성 당시에 VPNGATE VPN인가?"의 여부가 아닙니다.</td></tr>' +
              '</foot>' +
              "</table>"
            ).format(country.toLowerCase(), countryName, isp, result.indexOf(ip) != -1 ? "Y" : "N");
          }
        });
      });
    }

    if (/\/document(?:#.+|)$/.test(location.href)) {
      var rows = document.querySelectorAll('table tr');
      var contCount = 0,
        contTotalBytes = 0,
        contDocuments = 0,
        deletedDocuments = [],
        createdDocuments = [],
        contributedAt = [];
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
        if (row.querySelector('i')) {
          var italicText = row.querySelector('i').innerHTML;
          if (italicText == '(새 문서)' && createdDocuments.indexOf(documentName) == -1) createdDocuments.push(documentName);
          else if (italicText == '(삭제)' && deletedDocuments.indexOf(documentName) == -1) deletedDocuments.push(documentName);
        }

        if (row.querySelector('td:nth-child(3)')) {
          contributedAt.push(namuDTParse(row.querySelector('td:nth-child(3)').innerHTML));
        }
      }
      p.innerHTML += ('<table class="contInfo">' +
        '<tfoot>' +
        '<tr><td colspan="2" style="border-top: 1px solid black;">최근 30일간의 데이터만 반영되었으므로, 최근 30일 간의 기여 정보입니다.</td></tr>' +
        '</foot>' +
        '<tbody>' +
        '<tr><td>총 기여 횟수</td><td>{0}회</td></tr>' +
        '<tr><td>기여한 바이트 총합</td><td>{1}bytes</td></tr>' +
        '<tr><td>총 기여한 문서 (ACL 변경, 문서 이동 포함) 수</td><td>{2}개</td></tr>' +
        '<tr><td>삭제한 문서 수</td><td>{3}개</td></tr>' +
        '<tr><td>새로 만든 문서 수</td><td>{4}개</td></tr>' +
        '<tr><td>한 문서당 평균 기여 바이트</td><td>{5}bytes</td></tr>' +
        '<tr><td>시간대별 기여/활동 횟수 총합(문서 기여)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>' +
        '</tbody>' +
        '</table>').format(contCount, contTotalBytes, documents.length, deletedDocuments.length, createdDocuments.length, (contTotalBytes / documents.length));
      p.querySelector('a#punch').addEventListener('click', function() {
        var win = TooSimplePopup();
        win.title('시간대별 기여/활동 횟수 총합(문서 기여)');
        win.content(function(element) {
          element.appendChild(makeHeatTable(contributedAt));
        });
        win.button('닫기', win.close);
      })
    } else if (/\/discuss(?:#.+|)$/.test(location.href)) {
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
      var talkedAt = [];
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
        if (row.querySelector('td:nth-child(3)')) {
          talkedAt.push(namuDTParse(row.querySelector('td:nth-child(3)').innerHTML));
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
      p.innerHTML += ('<table class="contInfo">' +
        '<tfoot>' +
        '<tr><td colspan="2" style="border-top: 1px solid black;">최근 30일 간의 토론 정보만 반영되었으므로, 최근 30일 간의 토론 정보입니다.</td></tr>' +
        '</tfoot>' +
        '<tbody>' +
        '<tr><td>총 발언 수</td><td>{0}</td></tr>' +
        '<tr><td>참여한 토론 수</td><td>{1}</td></tr>' +
        '<tr><td>한(1) 토론당 평균 발언 수</td><td>{2}</td></tr>' +
        '<tr><td>한(1) 토론당 발언 수 표준편차</td><td>{3}</td></tr>' +
        '<tr><td>시간대별 기여/활동 횟수 총합(토론)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>' +
        '</tbody>' +
        '</table>').format(totalTalks, discussCount, avgTalks, standardDeviation(Talks));
      p.querySelector('a#punch').addEventListener('click', function() {
        var win = TooSimplePopup();
        win.title('시간대별 기여/활동 횟수 총합(토론)');
        win.content(function(container) {
          container.appendChild(makeHeatTable(talkedAt));
        });
        win.button('닫기', win.close);
      })
    } else {
      delete p;
    }
    if (typeof p !== 'undefined') insertBeforeTable(p);
  } else if (ENV.IsDiff) {
    setTimeout(function() {
      try {
        var diffTitle = document.querySelector('#diffoutput thead th.texttitle');
        if (diffTitle == null) return;
        var baseUri = ENV.IsSSL ? "https://namu.wiki" : "http://no-ssl.namu.wiki";
        var newDifftitle = '<span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={2}&rev={3}">(r{2} vs r{3})</a></span> <a href="{0}/w/{1}?rev={3}" title="r{3} 버전 보기">r{3}</a> vs. <a href="{0}/w/{1}?rev={4}" title="r{4} 버전 보기">r{4}</a> <span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={4}&rev={5}">(r{4} vs r{5})</a></span> <span style="font-weight: lighter;"><a href="{0}/history/{1}">(이 문서의 역사)</a></span>'.format(
          baseUri /*{0}*/ , ENV.docTitle /*{1}*/ , ENV.beforeRev - 1 /*{2}*/ , ENV.beforeRev /*{3}*/ , ENV.afterRev /*{4}*/ , ENV.afterRev + 1 /*{5}*/
        );
        diffTitle.innerHTML = newDifftitle;
      } catch (err) {
        alert(err.message + '\n' + err.stack);
      }
    }, 500);
  }
}

// 아이덴티콘 버그 수정
setInterval(function() {
  if (!/^https?:\/\/(?:no-ssl\.|)namu\.wiki\/discuss\/(.+?)/.test(location.href)) {
    return;
  }
  var identicons = document.querySelectorAll('.nf-identicon');
  for (var i = 0; i < identicons.length; i++) {
    var ide = identicons[i];
    var pa = ide.parentNode;

    pa.removeChild(ide);
    pa.style.marginTop = '';
  }
  if (document.querySelector('#nf-identicon-css') != null) {
    var cssTag = document.querySelector('#nf-identicon-css');
    cssTag.parentNode.removeChild(cssTag);
  }
}, 50);

// 설정 메뉴 추가
addItemToMemberMenu("NamuFix 설정", function() {
  var win = TooSimplePopup();
  var elems = {};
  win.title('NamuFix 설정');
  SET.load();
  win.content(function(el) {
    el.innerHTML = '<style>h1.wsmall{font-size: 14pt;}</style>' +
      '<h1 class="wsmall">토론 아이덴티콘</h1>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="icon">디시라이트 갤러콘 방식<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="headBg">스레딕 헬퍼 방식<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="identicon">아이덴티콘<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="none">사용 안함' +
      '<h1 class="wsmall">토론 아이덴티콘 명도</h1>' +
      '<p>스레딕 헬퍼 방식을 사용하는 경우에만 적용됩니다.</p>' +
      '<label for="discussIdentiLightness">명도</label><input name="discussIdentiLightness" data-setname="discussIdentiLightness" type="range" max="1" min="0" step="0.01"><br>' +
      '<label for="discussIdentiSaturation">순도</label><input name="discussIdentiSaturation" data-setname="discussIdentiSaturation" type="range" max="1" min="0" step="0.01">' +
      '<h1 class="wsmall">토론시 취소선</h1>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="0">표시<br>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="0.5">반숨김<br>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="1">숨기기<br>' +
      '<h1 class="wsmall">토론시 앵커 미리보기</h1>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="0">사용하지 않음<br>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="1">마우스를 올리면 미리보기 표시<br>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="2">토론 메세지 위에 인용형식으로 표시<br>' +
      '<input type="checkbox" name="removeNFQuotesInAnchorPreview" data-setname="removeNFQuotesInAnchorPreview" data-as-boolean>토론 메세지 위에 인용형식으로 표시할때, 인용문 안에 인용 형식으로 표시된 미리보기 제거';
    var optionTags = document.querySelectorAll('[data-setname]');
    SET.load();
    for (var i = 0; i < optionTags.length; i++) {
      var tag = optionTags[i];
      var t = tag.getAttribute('type');
      var sn = tag.dataset.setname;
      if (t == "radio" && tag.dataset.setvalue == SET[sn]) {
        tag.checked = true;
      } else if ((t == "checkbox" && tag.dataset.setvalueOnChecked == SET[sn]) || (t == "checkbox" && tag.hasAttribute("data-as-boolean") && SET[sn])) {
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
        SET[sn] = tag.hasAttribute("data-as-boolean") ? tag.checked : tag.checked ? t.dataset.setvalueOnChecked : t.dataset.setvalueOnUnchecked;
      } else if (["text", "password", "number", "range"].indexOf(t) != -1) {
        SET[sn] = tag.value;
      }
    }
    SET.save();
    win.close();
  });
});
addItemToMemberMenu("Imgur 이미지 삭제 주소들", function() {
  SET.load();
  var win = TooSimplePopup();
  var divWithScrolls = document.createElement("div");
  divWithScrolls.style.overflow = 'scroll';
  divWithScrolls.style.maxHeight = '800px';
  divWithScrolls.style.maxWidth = '1200px';

  var table = document.createElement("table");
  table.innerHTML = '<tr><th style="min-width: 200px;">업로드한 날짜/시각</th><th>이름</th><th>이미지 주소(다이렉트)</th><th>이미지 삭제 주소</th></tr>';
  var addRow = function(dt, dna, dil, del) {
    var tr = document.createElement("tr");
    var appendTd = function(t) {
      var td = document.createElement("td");
      td.innerHTML = t;
      tr.appendChild(td);
    }
    appendTd(formatDateTime(dt));
    appendTd(dna == null ? '<span style="color: red;">정보 없음</span>' : dna);
    appendTd('<a href="' + dil + '" target="_blank">' + dil + '</a>');
    appendTd('<a href="' + del + '" target="_blank">' + del + '</a>');
    table.appendChild(tr);
  }
  for (var i = 0; i < SET.imgurDeletionLinks.length; i++) {
    var ii = SET.imgurDeletionLinks[i];
    addRow(ii.uploadedAt, typeof ii.name !== "undefined" ? ii.name : null, ii.imgUrl, ii.deleteionUrl);
  }
  win.content(function(el) {
    el.appendChild(table);
  });
  win.title('이미지 삭제 주소들');
  win.button('닫기', win.close);
});
addItemToMemberMenu('설정 백업/복업', function() {
  if (!confirm('경고 : 이 기능은 불안정합니다.\n그래도 진행하시겠습니까?'))
    return;
  if (confirm('백업입니까?')) {
    var keys = GM_listValues();
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
      var ke = keys[i];
      obj[ke] = GM_getValue(ke);
    }
    prompt('복사해서 어딘가에 보관해두세요.', JSON.stringify(obj));
  } else if (confirm('그러면 복원입니까?')) {
    var obj = prompt('**원문 그대로** 복사하세요.');
    obj = JSON.stringify(obj);
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var ke = keys[i];
      GM_setValue(ke, obj[ke]);
    }
  } else {
    alert('취소됨.');
  }
})

mainFunc();
listenPJAX(mainFunc);

// 업데이트 확인
GM_xmlhttpRequest({
  method: "GET",
  url: "https://api.github.com/repos/LiteHell/NamuFix/releases/latest",
  onload: function(res) {
    var obj = JSON.parse(res.responseText);
    var currentVersion = GM_info.script.version;
    var latestVersion = obj.tag_name;
    if (currentVersion != latestVersion) {
      var scriptUrl = 'https://github.com/LiteHell/NamuFix/raw/' + latestVersion + '/NamuFix.user.js';
      var win = TooSimplePopup();
      win.title('새버전 설치');
      win.content(function(element) {
        // 변경 사항 : obj.body
        element.innerHTML = '업데이트가 있습니다.<br><br>현재 사용중인 버전 : ' + currentVersion + '<br>' +
          '현재 최신 버전 : ' + latestVersion + '<br><br>' +
          latestVersion + '버전에서의 변경 사항<pre style="border-left: 6px solid green; padding: 10px; font-size: 13px; font-family: sans-family;" id="changeLog"></pre>' +
          '<p><a href="' + scriptUrl + '" style="text-decoration: none;"><button type="button" style="display: block; margin: 0 auto;">최신 버전 설치</button></a></p>' +
          '설치 후 새로고침을 해야 적용됩니다.<br>버그 신고 및 건의는 <a href="https://github.com/LiteHell/NamuFix/issues">이슈 트래커</a>에서 해주시면 감사하겠습니다.';
        element.querySelector('#changeLog').innerHTML = obj.body;
      });

      win.button('닫기', win.close);
      win.button('새로고침', function() {
        location.reload();
      });
    }
  }
});
