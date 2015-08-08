// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     150808.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
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

var ENV = {};
ENV.IsEditing = /https?:\/\/namu\.wiki\/edit\/(.+?)/.test(location.href);
ENV.Discussing = /https?:\/\/namu\.wiki\/topic\/(.+?)/.test(location.href);
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

  // set Size
  if(ENV.Discussing)
    rootDiv.style.height = '170px';
  else
    rootDiv.style.height='600px';

  // Add NamuFix Div
  var oldTextarea = document.querySelector("textarea");
  var wText=oldTextarea.value;
  oldTextarea.parentNode.insertBefore(rootDiv, oldTextarea);
  oldTextarea.parentNode.removeChild(oldTextarea);
  txtarea.value = wText;
}
