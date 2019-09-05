// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 등 더시드 사용 위키의 편집 인터페이스 등을 개선합니다.
// @include     https://namu.wiki/*
// @include     https://theseed.io/*
// @include     https://board.namu.wiki/*
// @version     190905.0
// @author      LiteHell
// @downloadURL https://namufix.wikimasonry.org/latest.js
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://cdn.rawgit.com/Caligatio/jsSHA/v2.3.1/src/sha.js
// @require     https://cdn.rawgit.com/zenozeng/color-hash/v1.0.3/dist/color-hash.js
// @require     https://cdn.rawgit.com/ben-liang/pnglib/91a91b7f840fdf19ef34a32df8051f2178957293/pnglib.js
// @require     https://cdn.rawgit.com/stewartlord/identicon.js/7c4b4efdb7e2aba458eba14b24ba14e8e2bcdb2a/identicon.js
// @require     https://cdn.jsdelivr.net/npm/jdenticon@1.8.0
// @require     https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/7f2a8a81f11f980c1dfa6b5b2213cd38b8bbde3c/TooSimplePopupLib.js
// @require     https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/difflib.js
// @require     https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/diffview.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.3/moment-with-locales.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.14/moment-timezone-with-data.min.js
// @require     https://cdn.jsdelivr.net/npm/async@2.6.1/dist/async.min.js
// @require     https://cdn.rawgit.com/mathiasbynens/he/v1.1.1/he.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/data/korCountryNames.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/FlexiColorPicker.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/skinDependency.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/flagUtils.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/hashUtils.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/NFStorage.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/utils.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/whoisIpUtils.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/namuapi.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/f55ab32d98c69e89949200a6b485524ae28401da/src/boardArchivers.js
// @connect     cdn.rawgit.com
// @connect     cdnjs.cloudflare.com
// @connect     jsdelivr.net
// @connect     api.github.com
// @connect     ipinfo.io
// @connect     wtfismyip.com
// @connect     www.googleapis.com
// @connect     web.archive.org
// @connect     archive.is
// @connect     www.vpngate.net
// @connect     namufix.wikimasonry.org
// @connect     phpgongbu.ga
// @connect     namuwiki.ml
// @connect     twitter.com
// @connect     facebook.com
// @connect     www.facebook.com
// @grant       GM_openInTab
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_info
// @grant       GM_getResourceURL
// @grant       GM.openInTab
// @grant       GM.xmlHttpRequest
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @grant       GM.listValues
// @grant       GM.info
// @grant       GM.getResourceUrl
// @run-at      document-end
// @noframes
// ==/UserScript==
/* jshint ignore:start */
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
let {
   getFlagIcon
} = new flagUtils();
let {
   SHA512,
   SHA1,
   SHA256
} = new hashUtils();
let {
   nOu,
   NF_addStyle,
   encodeHTMLComponent,
   decodeHTMLComponent,
   validateIP,
   formatDateTime,
   formatTimespan,
   insertCSS,
   enterTimespanPopup
} = new utils();
let {
   getIpInfo,
   getIpWhois,
   getVPNGateIPList,
   checkVPNGateIP,
   whoisPopup
} = new whoisIpUtils();
let SET = new NFStorage();

function batchBlockFunction(evt, opts) {
   evt.preventDefault();
   var win = TooSimplePopup();
   win.title('계정/IP 일괄 차단');
   win.content(function (con) {
      var expire = 0;
      con.innerHTML = '<p>아래에 차단할 IP주소/계정들을 입력해주세요.' + '차단 사유 : <input type="text" id="note"></input><br>' + '차단기간 : <span id="expire_display">영구</span> <a href="#" id="setExpire">(차단기간 설정)</a>(참고 : 0초 = 영구차단)<br>' + '로그인 허용 여부 : <input type="checkbox" id="allowLogin"></input><br>' + '※ IP 차단 해제시에는 차단사유/영구차단 여부/로그인 허용 여부를 설정할 필요 없으며 IP는 IPv4만 인식합니다.</p>' + '차단할 계정/IP (개행으로 구분) : <br>' + '<textarea style="width: 800px; max-width: 80vw; height: 500px; max-height: 80vh;"></textarea>';
      con.querySelector('a#setExpire')
         .addEventListener('click', function (evt) {
            evt.preventDefault();
            enterTimespanPopup('차단기간 설정', function (span) {
               if (span === null) {
                  return alert('입력이 없습니다.');
               } else {
                  expire = span;
                  con.querySelector('#expire_display')
                     .textContent = span == 0 ? '영구' : expire + '초 ';
               }
            });
         })
      win.button('닫기', win.close);
      win.button('VPNGATE IP 불러오기', async function () {
         let win = TooSimplePopup();
         win.title('불러오는 중');
         win.content(e => e.innerHTML = "불러오는 중입니다. 잠시만 기다려주십시오.");
         let vpngateIPs = await getVPNGateIPList();
         let textarea = con.querySelector('textarea');
         textarea.value += '\n' + vpngateIPs.map(v => v + "/32")
            .join("\n");
         win.close();
      })
      win.button('차단기록 검색', async function () {
         let searchWin = TooSimplePopup();
         let queryInfo;
         searchWin.title('차단기록 검색');
         searchWin.content(searchWinCon => {
            searchWinCon.innerHTML = `
          <style>.search-prev[disabled], .search-next[disabled] {background: darkgray; text-decoration: line-through;}</style>
          <div class="table-responsive-sm">
          <table class="table table-striped table-bordered table-hover table-sm">
          <thead>
          <tr>
          <td>선택</td>
          <td>유형</td>
          <td>실행자</td>
          <td>피실행자</td>
          <td>사유</td>
          <td>기간</td>
          <td>차단일시</td>
          </tr>
          </thead>
          <tbody>
          </tbody>
          </table>
          </div>
          <div class="search-pagination">
          </div>
          `;

            function processQuery() {
               let waitingWin = TooSimplePopup();
               waitingWin.title("진행중입니다");
               waitingWin.content(waitingWinCon => waitingWinCon.innerHTML = "진행중입니다. 잠시만 기다려주십시오.");
               namuapi.searchBlockHistory(queryInfo, (result) => {
                  queryInfo.from = result.nextResultPageFrom || null;
                  queryInfo.until = result.prevResultPageUntil || null;
                  let tbody = searchWinCon.querySelector('tbody');
                  tbody.innerHTML = "";
                  for (let i of result) {
                     // checkbox, type, blocker, blocked, reason, duration, at
                     tbody.innerHTML += `<tr data-blocked="${encodeHTMLComponent(JSON.stringify(i.blocked))}"><td><input type="checkbox" checked></td><td>${i.type}</td><td>${encodeHTMLComponent(i.blocker)}</td><td>${encodeHTMLComponent(i.blocked)}</td><td>${encodeHTMLComponent(i.reason)}</td><td>${i.duration}</td><td>${formatDateTime(i.at)}</td></tr>`;
                  }
                  waitingWin.close();
               });
            }
            searchWin.button('검색', () => {
               let queryWin = TooSimplePopup();
               queryWin.title('쿼리 입력');
               queryWin.content(queryWinCon => {
                  queryWinCon.innerHTML = `
            <div>
            쿼리 : 
            <input type="text" class="search-query" style="width: 500px; max-width: 80vw;"></input>
            </div>`;
                  queryWin.button('실행자 검색', () => {
                     queryInfo = {
                        query: queryWinCon.querySelector('.search-query')
                           .value,
                        isAuthor: true
                     };
                     processQuery();
                  });
                  queryWin.button('내용 검색', () => {
                     queryInfo = {
                        query: queryWinCon.querySelector('.search-query')
                           .value,
                        isAuthor: false
                     };
                     processQuery();
                  });
                  queryWin.button('닫기', queryWin.close);
               });
            });
            searchWin.button('선택된 항목 추가', () => {
               let isFirst = true;
               let textarea = con.querySelector('textarea');
               let waitingWin = TooSimplePopup();
               waitingWin.title('진행중입니다.');
               waitingWin.content(c => c.innerHTML = "진행중입니다.");
               for (let i of searchWinCon.querySelectorAll('tbody tr')) {
                  if (isFirst) {
                     textarea.value += '\n';
                     isFirst = false;
                  }
                  if (i.querySelector('input[type="checkbox"]')
                     .checked) textarea.value += JSON.parse(i.dataset.blocked) + "\n";
               }
               waitingWin.close();
            });
            searchWin.button('이전 결과', () => {
               if (queryInfo.until) {
                  delete queryInfo.from;
                  processQuery();
               } else {
                  alert('첫 페이지입니다.');
               }
            });
            searchWin.button('다음 결과', () => {
               if (queryInfo.from) {
                  delete queryInfo.until;
                  processQuery();
               } else {
                  alert('마지막 페이지입니다.');
               }
            });
            searchWin.button('닫기', searchWin.close);
         });
      })

      function parseTextarea() {
         let commonData = {
            note: con.querySelector('input#note')
               .value,
            expire: expire,
            allowLogin: con.querySelector('input#allowLogin')
               .checked
         }
         return con.querySelector('textarea')
            .value.split('\n')
            .map(v => v.trim())
            .filter(v => v != "")
            .map((v) => {
               let ipWithCIDR = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
               let data = JSON.parse(JSON.stringify(commonData));
               if (ipWithCIDR.test(v)) data.ip = v;
               else data.id = v;
               if (data.ip && !data.ip.includes("/")) data.ip += "/32";
               return data;
            });
      }

      function commonLoop(_datas, progressCallback) { // returns error object
         return new Promise((resolve, reject) => {
            let result = {
               errors: [],
               success: []
            };
            let datas = JSON.parse(JSON.stringify(_datas));
            console.log(SET.adminReqLimit);
            async.eachLimit(datas, SET.adminReqLimit, (data, callback) => {
               console.log('a');
               namuapi[data.handlerName](data.parameter, (err, target) => {
                  console.log('b');
                  console.log(err);
                  console.log(target);
                  if (err) {
                     result.errors.push({
                        target: data.parameter,
                        error: err
                     });
                  } else {
                     result.success.push(data.parameter);
                  }
                  if (progressCallback) progressCallback(data);
                  callback();
               });
            }, (err) => {
               return resolve(result);
            });
         });
      }
      win.button('차단', async function () {
         var waitingWin = TooSimplePopup();
         var errors = [];
         waitingWin.title('처리중');
         waitingWin.content(function (wwcon) {
            wwcon.innerHTML = "처리중입니다."
         });
         let datas = parseTextarea()
            .map(v => ({
               parameter: v,
               handlerName: v.ip ? "blockIP" : "blockAccount"
            }));
         let result = await commonLoop(datas, d => waitingWin.content(wwcon => wwcon.innerHTML = `처리 완료: ${d.parameter.ip || d.parameter.id}`));
         if (result.errors.length > 0) {
            waitingWin.content(wwcon => {
               wwcon.innerHTML = "오류가 있습니다.<br><br>" + result.errors.map(v => `${encodeHTMLComponent(v.target.ip || v.target.id)} : ${v.error}`)
                  .join("<br>");
            });
            waitingWin.button('닫기', waitingWin.close);
         } else {
            waitingWin.close();
         }
      });
      win.button('차단 해제', async function () {
         var waitingWin = TooSimplePopup();
         var errors = [];
         waitingWin.title('처리중');
         waitingWin.content(function (wwcon) {
            wwcon.innerHTML = "처리중입니다."
         });
         let datas = parseTextarea()
            .map(v => {
               if (v.ip) {
                  return {
                     parameter: v.ip,
                     handlerName: 'unblockIP'
                  };
               } else {
                  let tmp = {
                     parameter: v,
                     handlerName: 'blockAccount'
                  };
                  tmp.parameter.expire = -1;
                  return tmp;
               }
            });
         let result = await commonLoop(datas, d => waitingWin.content(wwcon => wwcon.innerHTML = `처리 완료: ${d.parameter.id ? d.parameter.id : d.parameter}`));
         if (result.errors.length > 0) {
            waitingWin.content(wwcon => {
               wwcon.innerHTML = "오류가 있습니다.<br><br>" + result.errors.map(v => `${encodeHTMLComponent(v.target.id || v.target)} : ${v.error}`)
                  .join("<br>");
            });
            waitingWin.button('닫기', waitingWin.close);
         } else {
            waitingWin.close();
         }
      });

      if (opts) {
         if (opts.blockees)
            con.querySelector('textarea').value = opts.blockees.join('\n');
      }
   });
}
if (location.host === 'board.namu.wiki') {
   async function runBoardFix() {
      await SET.load();
      // 이미지 업로드 함수
      function uploadXEImage(file, mid, name) {
         let formData = new FormData();
         formData.append('Filename', 'emoti.png')
         formData.append('')
         GM.xmlHttpRequest({
            url: 'https://board.namu.wiki'
         })
      }
      // 시간대 자동 변경
      if (SET.noLocaltimeOnNamuBoard !== false) {
         let times = document.querySelectorAll('.read_header > .meta > .time, .fbMeta .time');
         let origTimezone = "UTC" // America/Asuncion 아님.
         for (let i = 0; i < times.length; i++) {
            let t = moment.tz(times[i].textContent.trim(), "YYYY.MM.DD HH:mm", origTimezone);
            times[i].textContent = t.tz(moment.tz.guess())
               .format("YYYY.MM.DD HH:mm z")
         }
         if (times.length !== 0) console.log(`[NamuFix] 게시판 시간대 변경 완료. ${origTimezone} > ${moment.tz.guess()}`);
      }
      // 아카이브 버튼
      if (document.querySelector('.viewDocument .read_footer .btnArea a[onclick]') !== null) {
         let extraMenuLink = document.querySelector('.viewDocument .read_footer .btnArea a[onclick]');
         let documentId = /document_([0-9]+)/.exec(extraMenuLink.className)[1];
         let archiveLink = document.createElement("a");
         archiveLink.href = "#";
         archiveLink.target = "_blank";
         archiveLink.textContent = "아카이브";
         let clickHandler = async (evt) => {
            evt.preventDefault();
            archiveLink.textContent = "(진행중)";
            archiveLink.removeAttribute("href");
            archiveLink.removeEventListener("click", clickHandler);
            let archiveFunction = (new BoardArchiver(GM.info.script.version))[SET.defaultBoardArchiver];
            let archiveUrl = await archiveFunction(documentId);
            GM.openInTab(archiveUrl);
            archiveLink.textContent = "아카이브됨";
            archiveLink.href = archiveUrl;
         };
         archiveLink.addEventListener("click", clickHandler);
         extraMenuLink.parentNode.insertBefore(archiveLink, extraMenuLink.nextSibling);
      }
      // 댓글 상용구
      if (document.querySelector('.write_comment') && SET.commentMacros) {
         console.log('[NamuFix] 댓글창 감지됨.')
         let writeAuthorDiv = document.querySelector('.write_author');
         for (let i of SET.commentMacros.split(',')) {
            let macroName = i.split(':')[0];
            let macroContentParts = i.split(':');
            macroContentParts.shift();
            let macroContent = macroContentParts.join(':');
            let macroBtn = document.createElement("button");
            console.log(`[NamuFix] 매크로 버튼 추가중 (이름: ${macroName}, 내용: ${macroContent})`)
            macroBtn.setAttribute('type', 'button');
            macroBtn.innerHTML = '상용구 (' + macroName + ')';
            macroBtn.addEventListener('click', (evt) => {
               evt.preventDefault();
               let xeEditor = document.querySelector('.xpress-editor'),
                  hiddenContentInput = document.querySelector('.write_comment > input[name="content"]'),
                  writeForm = document.querySelector('.write_comment > .write_form');
               // XE에디터 제거
               xeEditor.parentNode.removeChild(xeEditor);
               // 기존 content input 제거
               hiddenContentInput.parentNode.removeChild(hiddenContentInput);
               // content input 추가
               let newContentInput = document.createElement('input');
               newContentInput.setAttribute('type', 'hidden');
               newContentInput.name = "content";
               newContentInput.value = macroContent;
               writeForm.appendChild(newContentInput);
               // 댓글 작성
               document.querySelector('.write_author button[type="submit"]')
                  .click();
            })
            writeAuthorDiv.appendChild(macroBtn, writeAuthorDiv.lastChild);
         }
      }
      // 일괄 차단 메뉴추가
      if (SET.addBatchBlockMenu) {
         await insertCSS("https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/edad912e28eeacdc3fd8b6e6b7ac5cafc46d95b6/TooSimplePopupLib.css");
         let item = document.createElement('li');
         item.innerHTML = '<a href="#">일괄 차단</a>';
         item.querySelector('a')
            .addEventListener('click', batchBlockFunction);
         // 화면 작으면 일괄차단 버튼이 레이아웃을 뵈게 싫게 만듬.
         let firstMenu = document.querySelector('#main-navbar ul.navbar-nav.nav > li:first-child');
         firstMenu.parentNode.insertBefore(item, firstMenu);
         firstMenu.parentNode.removeChild(firstMenu);
      }
      // 닉네임/IP주소 기여목록 링크
      if (SET.userContribLinkOnBoard) {
         let authors = [...document.querySelectorAll('.feedback .fbList .fbMeta .author span, .board .board_read .read_header .meta .name, .board_list tr td.author a')];
         authors.forEach(i => {
            let username = i.textContent.trim(),
                link = `https://namu.wiki/contribution/${validateIP(username) ? 'ip' : 'author'}/${username}/document`;
            if(i.tagName == 'A') {
               i.href = link;
               i.target = '_blank';
               i.removeAttribute('onclick');
            } else {
               let anchor = document.createElement('a');
               anchor.href = link;
               anchor.style.textDecoration = 'none';
               anchor.style.color = 'black';
               anchor.target = '_blank';
               anchor.textContent = username;
               i.innerHTML = '';
               i.appendChild(anchor);
            }
         });
      }
   }
   runBoardFix();
} else(async function (SET) {
   console.log(`[NamuFix] 현재 버전 : ${GM.info.script.version}`);
   if (location.hostname == 'no-ssl.namu.wiki') location.hostname = 'namu.wiki';
   await insertCSS("https://cdn.rawgit.com/LiteHell/NamuFix/284db44ac1d89ff0cbd1155c3372db38be3bc140/NamuFix.css");
   await insertCSS("https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/edad912e28eeacdc3fd8b6e6b7ac5cafc46d95b6/TooSimplePopupLib.css");
   await insertCSS("https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/diffview.css");
   console.log('[NamuFix] CSS 삽입됨.');
   // 업데이트 확인
   GM.xmlHttpRequest({
      method: "GET",
      url: "https://api.github.com/repos/LiteHell/NamuFix/releases/latest",
      onload: function (res) {
         var obj = JSON.parse(res.responseText);
         if (typeof obj.message !== 'undefined' && obj.message.indexOf('API rate limit') != -1) {
            console.log('[NamuFix] NamuFix 업데이트 연기! (GitHub API 제한에 따른 오류)');
            return; // GitHub API 오류
         }
         var currentVersion = GM.info.script.version;
         if (!obj.tag_name) {
            console.log('[NamuFix] NamuFix 업데이트 연기! (최신 버전을 읽을 수 없음)');
            return;
         }
         var latestVersion = obj.tag_name;
         if (currentVersion != latestVersion) {
            var scriptUrl = 'https://github.com/LiteHell/NamuFix/raw/' + latestVersion + '/NamuFix.user.js';
            var win = TooSimplePopup();
            win.title('새 버전 설치');
            win.content(function (element) {
               // 변경 사항 : obj.body
               element.innerHTML = '업데이트가 있습니다.<br><br>현재 사용중인 버전 : ' + currentVersion + '<br>' + '현재 최신 버전 : ' + latestVersion + '<br><br>' + latestVersion + '버전에서의 변경 사항<pre style="border-left: 6px solid green; padding: 10px; font-size: 13px; font-family: sans-family;" id="changeLog"></pre>' + '<p><a href="' + scriptUrl + '" style="text-decoration: none;"><button type="button" style="display: block; margin: 0 auto;">최신 버전 설치</button></a></p>' + '설치 후 새로고침을 해야 적용됩니다.<br>버그 신고 및 건의는 <a href="https://github.com/LiteHell/NamuFix/issues">이슈 트래커</a>에서 해주시면 감사하겠습니다.';
               element.querySelector('#changeLog')
                  .innerHTML = obj.body;
            });
            win.button('닫기', win.close);
            win.button('새로고침', function () {
               location.reload();
            });
         }
      }
   });
   let skinDependency = getSkinDependency(new RegExp(`(${getSkinSupports().join('|')})`, 'i')
      .exec(document.body.className)[1].toLowerCase());
   // 문서/역사/편집 페이지 등에서 버튼 추가 함수
   let addArticleButton = skinDependency.addArticleButton;

   function uniqueID() {
      var dt = Date.now();
      var url = location.href;
      var randomized = Math.floor(Math.random() * 48158964189489678525869410);
      return SHA512(String(dt)
         .concat(dt, '\n', url, '\n', String(randomized)));
   }

   function listenPJAX(callback) {
      // create elements
      var pjaxButton = document.createElement("button");
      var scriptElement = document.createElement("script");
      // configure button
      pjaxButton.style.display = "none";
      pjaxButton.id = "nfFuckingPJAX"
      pjaxButton.addEventListener("click", callback);
      // configure script
      scriptElement.setAttribute("type", "text/javascript");
      scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX").click();})';
      // add elements
      document.body.appendChild(pjaxButton);
      document.head.appendChild(scriptElement);
   }
   async function INITSET() { // Storage INIT
      await SET.load();
      if (nOu(SET.tempsaves)) SET.tempsaves = {};
      if (nOu(SET.recentlyUsedTemplates)) SET.recentlyUsedTemplates = [];
      if (nOu(SET.imgurDeletionLinks)) SET.imgurDeletionLinks = [];
      if (nOu(SET.discussIdenti)) SET.discussIdenti = 'icon'; // icon, headBg, none
      if (nOu(SET.discussIdentiLightness)) SET.discussIdentiLightness = 0.7;
      if (nOu(SET.discussIdentiSaturation)) SET.discussIdentiSaturation = 0.5;
      if (nOu(SET.favorites)) SET.favorites = [];
      if (nOu(SET.customIdenticons)) SET.customIdenticons = {};
      if (nOu(SET.discussAnchorPreviewType)) SET.discussAnchorPreviewType = 1; // 0 : None, 1 : mouseover, 2 : quote
      else SET.discussAnchorPreviewType = Number(SET.discussAnchorPreviewType);
      if (nOu(SET.removeNFQuotesInAnchorPreview)) SET.removeNFQuotesInAnchorPreview = false;
      if (nOu(SET.lookupIPonDiscuss)) SET.lookupIPonDiscuss = true;
      if (nOu(SET.ignoreNonSenkawaWarning)) SET.ignoreNonSenkawaWarning = false;
      if (nOu(SET.loadUnvisibleReses)) SET.loadUnvisibleReses = false;
      if (nOu(SET.ipInfoDefaultOrg)) SET.ipInfoDefaultOrg = "ipinfo.io"; //ipinfo.io, KISAISP, KISAuser, KISAuserOrISP
      if (nOu(SET.autoTempsaveSpan)) SET.autoTempsaveSpan = 1000 * 60 * 5; // 5분
      if (nOu(SET.addBatchBlockMenu)) SET.addBatchBlockMenu = false;
      if (nOu(SET.noLocaltimeOnNamuBoard)) SET.noLocaltimeOnNamuBoard = true;
      if (nOu(SET.fileUploadReqLimit)) SET.fileUploadReqLimit = 3;
      if (nOu(SET.adminReqLimit)) SET.adminReqLimit = 3;
      if (nOu(SET.quickBlockReasonTemplate_discuss)) SET.quickBlockReasonTemplate_discuss = '긴급조치 https://${host}/thread/${threadNo} #${messageNo}' // ${host}, ${threadNo}, ${messageNo}
      if (nOu(SET.quickBlockReasonTemplate_history)) SET.quickBlockReasonTemplate_history = '긴급조치 [[${docName}]] ${revisionNo}' // ${host}, ${docName}, ${revisionNo}
      if (nOu(SET.quickBlockDefaultDuration)) SET.quickBlockDefaultDuration = 0;
      if (nOu(SET.addQuickBlockLink)) SET.addQuickBlockLink = false;
      if (nOu(SET.notifyForUnvisibleThreads)) SET.notifyForUnvisibleThreads = false;
      if (nOu(SET.checkWhoisNetTypeOnDiscuss)) SET.checkWhoisNetTypeOnDiscuss = false;
      if (nOu(SET.checkedServerNotices)) SET.checkedServerNotices = [];
      if (nOu(SET.additionalScript)) SET.additionalScript = "";
      if (nOu(SET.umiCookie)) SET.umiCookie = "";
      if (nOu(SET.unprefixedFilename)) SET.unprefixedFilename = false;
      if (nOu(SET.addSnsShareButton)) SET.addSnsShareButton = false;
      if (nOu(SET.commentMacros)) SET.commentMacros = '';
      if (nOu(SET.ipBlockHistoryCheckDelay)) SET.ipBlockHistoryCheckDelay = 500;
      if (nOu(SET.identiconLibrary)) SET.identiconLibrary = 'jdenticon'; // jdenticon, identicon, gravatar, robohash
      if (nOu(SET.emphasizeResesWhenMouseover)) SET.emphasizeResesWhenMouseover = false;
      if (nOu(SET.defaultBoardArchiver)) SET.defaultBoardArchiver = 'namuwikiml';
      if (nOu(SET.fastRevert)) SET.fastRevert = false;
      if (nOu(SET.askFastRevertLog)) SET.askFastRevertLog = false;
      if (nOu(SET.fastRevertDefaultLog)) SET.fastRevertDefaultLog = '반달 복구';
      if (nOu(SET.lookupIqsOnKisaWhois)) SET.lookupIqsOnKisaWhois = false;
      if (nOu(SET.hideHiddenResBody)) SET.hideHiddenResBody = false;
      if (nOu(SET.robohashSet)) SET.robohashSet = 'any';
      if (nOu(SET.addBatchBlindButton)) SET.addBatchBlindButton = false;
      if (nOu(SET.slientBlind)) SET.slientBlind = false;
      if (nOu(SET.userContribLinkOnBoard)) SET.userContribLinkOnBoard = true;
      if (nOu(SET.addEditRequestCloseMenu)) SET.addEditRequestCloseMenu = false;
      if (nOu(SET.defaultEditRequestCloseReason)) SET.defaultEditRequestCloseReason = '반달';
      await SET.save();
   }
   let addItemToMemberMenu = skinDependency.addItemToMemberMenu;

   function makeTabs() {
      var div = document.createElement("div");
      div.className = "nf-tabs";
      div.innerHTML = "<ul></ul>";
      var ul = div.querySelector("ul");
      return {
         tab: function (text) {
            var item = document.createElement("li");
            item.innerHTML = text;
            item.addEventListener('click', function () {
               var selectedTabs = div.querySelectorAll('li.selected');
               for (var i = 0; i < selectedTabs.length; i++) {
                  selectedTabs[i].className = selectedTabs[i].className.replace(/selected/mg, '');
               }
               item.className = "selected";
            });
            ul.appendChild(item);
            return {
               click: function (callback) {
                  item.addEventListener('click', callback);
                  return this;
               },
               selected: function () {
                  if (item.className.indexOf('selected') == -1) item.className += ' selected';
                  return this;
               }
            };
         },
         get: function () {
            return div;
         }
      };
   }
   // i : {author : {name, isIP}, defaultReason, defaultDuration}
   function quickBlockPopup(i) {
      let win = TooSimplePopup();
      win.title("빠른 차단");
      win.content(el => {
         el.innerHTML = `<p>차단 대상 : ${encodeHTMLComponent(i.author.name)} ${i.author.isIP ? "<i>(IP)</i>" : "<i>(계정)</i>"}</p>차단 사유 : <input type="text" id="reason"></input><br>차단 기간 : <input type="number" id="duration"></input><a href="#" id="enterDuration">(간편하게 입력)</a><br><div id="allowLoginDiv">로그인 허용 : <input type="checkbox" id="allowLogin"></input></div><br><i>(참고 : NamuFix 설정에서 차단기간 기본값을 변경할 수 있습니다.)`
         if (!i.author.isIP) {
            el.querySelector('#allowLoginDiv')
               .style.display = 'none';
         }
         el.querySelector('a#enterDuration')
            .addEventListener('click', (evt) => {
               evt.preventDefault();
               enterTimespanPopup("차단기간 간편입력", (span) => {
                  if (span) el.querySelector('#duration')
                     .value = span;
               })
            })
         el.querySelector('#duration')
            .value = i.defaultDuration;
         el.querySelector('#reason')
            .value = i.defaultReason;
         el.querySelector('#reason')
            .style.width = '500px';
         el.querySelector('#reason')
            .style.maxWidth = '30vw';
         win.button('닫기', win.close);
         win.button('차단', () => {
            if (i.author.isIP) {
               namuapi.blockIP({
                  ip: i.author.name,
                  note: el.querySelector('#reason')
                     .value,
                  expire: el.querySelector('#duration')
                     .value,
                  allowLogin: el.querySelector('#allowLogin')
                     .checked
               }, (err, data) => {
                  if (err) alert('오류 발생 : ' + err);
                  else win.close();
               })
            } else {
               namuapi.blockAccount({
                  id: i.author.name,
                  note: el.querySelector('#reason')
                     .value,
                  expire: el.querySelector('#duration')
                     .value,
                  allowLogin: el.querySelector('#allowLogin')
                     .checked
               }, (err, data) => {
                  if (err) alert('오류 발생 : ' + err);
                  else win.close();
               })
            }
         });
      });
   }

   function createDesigner(buttonBar) {
      var Designer = {};
      Designer.button = function (txt) {
         var btn = document.createElement('button');
         btn.className = 'NamaEditor NEMenuButton';
         btn.setAttribute('type', 'button');
         btn.innerHTML = txt;
         buttonBar.appendChild(btn);
         var r = {
            click: function (func) {
               btn.addEventListener('click', func);
               return r;
            },
            hoverMessage: function (msg) {
               btn.setAttribute('title', msg);
               return r;
            },
            right: function () {
               btn.className += ' NEright';
               return r;
            },
            active: function () {
               btn.setAttribute('active', 'yes');
               return r;
            },
            deactive: function () {
               btn.removeAttribute('active')
               return r;
            },
            remove: function () {
               btn.parentNode.removeChild(btn);
               return r;
            },
            use: function () {
               buttonBar.appendChild(btn);
               return r;
            }
         };
         return r;
      };
      Designer.dropdown = function (txt) {
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
         dropdownButton.addEventListener('click', function () {
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
            button: function (iconTxt, txt) {
               var liTag = document.createElement('li');
               liTag.innerHTML = '<span class="NEHeadIcon">' + iconTxt + '</span><span class="NEDescText">' + txt + '</span>'
               liTag.addEventListener('click', function () {
                  dropdown.style.display = '';
               })
               dropdownList.appendChild(liTag);
               var r = {
                  icon: function (iconTxt) {
                     liTag.querySelector('.NEHeadIcon')
                        .innerHTML = iconTxt;
                     return r;
                  },
                  text: function (txt) {
                     liTag.querySElector('.NEDescText')
                        .innerHTML = txt;
                     return r;
                  },
                  hoverMessage: function (msg) {
                     liTag.setAttribute('title', msg);
                     return r;
                  },
                  click: function (handler) {
                     liTag.addEventListener('click', handler);
                     return r;
                  },
                  right: function () {
                     liTag.className += 'NEright';
                     return r;
                  },
                  remove: function () {
                     dropdownList.removeChild(liTag);
                     return r;
                  },
                  insert: function () {
                     dropdownList.appendChild(liTag);
                     return r;
                  },
                  backwalk: function () {
                     dropdownList.removeChild(ilTag);
                     dropdownList.appendChild(ilTag);
                     return r;
                  }
               };
               return r;
            },
            right: function () {
               liTag.className += 'NEright';
               return hr;
            },
            hoverMessage: function (txt) {
               dropdownButton.setAttribute('title', txt);
               return hr;
            },
            clear: function () {
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
      r.value = function () {
         if (arguments.length == 0) return txtarea.value;
         else txtarea.value = arguments[0];
      };
      r.selectionText = function () {
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
      r.selectionStart = function () {
         if (arguments.length == 0) return txtarea.selectionStart;
         else txtarea.selectionStart = arguments[0];
      };
      r.selectionTest = function (r) {
         return this.selectionText()
            .search(r) != -1;
      };
      r.valueTest = function (r) {
         return this.value()
            .search(r) != -1;
      };
      r.selectionEnd = function () {
         if (arguments.length == 0) return txtarea.selectionEnd;
         else txtarea.selectionEnd = arguments[0];
      };
      r.selectionLength = function () {
         if (arguments.length == 0) return (txtarea.selectionEnd - txtarea.selectionStart);
         else txtarea.selectionEnd = txtarea.selectionStart + arguments[0];
      };
      r.select = function (s, e) {
         txtarea.focus();
         txtarea.selectionStart = s;
         if (typeof e !== 'undefined') txtarea.selectionEnd = e;
      }
      r.WrapSelection = function (l, r) {
         if (arguments.length == 1) var r = l;
         var t = this.selectionText();
         if (typeof t === 'undefined' || t == null || t == '') t = '내용';
         var s = this.selectionStart()
         t = l + t + r;
         this.selectionText(t);
         this.select(s + l.length, s + t.length - r.length)
      };
      r.ToggleWrapSelection = function (l, r) {
         function isWrapped(t) {
            return t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length);
         }
         if (arguments.length == 1) var r = l;
         var t = this.selectionText();
         var t_m = this.value()
            .substring(this.selectionStart() - l.length, this.selectionEnd() + r.length);
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
      elm.addEventListener('change', function (evt) {
         callback(evt.target.files, function () {
            document.body.removeChild(elm);
         })
      });
      elm.click();
   }
   await INITSET();

   if (SET.lookupIqsOnKisaWhois) {
      let originalWhoisPopup = whoisPopup;
      whoisPopup = function (ip, opts) { originalWhoisPopup(ip, opts ? opts : {iqs: true}); };
   }

   console.log("[NamuFix] 설정 초기화 완료");
   if (SET.umiCookie.trim()
      .length !== 0) {
      document.cookie = 'umi=' + SET.umiCookie + ";path=/;domain=namu.wiki";
      console.log("[NamuFix] umi 쿠키 설정 완료");
   }
   function editRequestBlockPopup(getENV) {
      return function() {
         let ENV = getENV();
         let win = TooSimplePopup(), getSelectedEditReqs, getCloseInfo;
         let refreshEditReqs = () => {
            namuapi.getOpenEditRequests(editReqs => {
               win.content(container => {
                  container.querySelector('.editreqs tbody').innerHTML = '';
                  for(let i = 0; i < editReqs.length; i++) {
                     let editReq = editReqs[i];
                     let row = document.createElement('tr');
                     row.innerHTML = `
                        <td><input type="checkbox" class="editreq_sel"></input></td>
                        <td><input type="radio" class="editreq_sel_help_a" name="editreq_sel_help_a"></input></td>
                        <td><input type="radio" class="editreq_sel_help_b" name="editreq_sel_help_b"></input></td>
                        <td><a href="${encodeHTMLComponent('/edit_request/' + editReq.no)}" target="_blank">${editReq.no}</a></td>
                        <td>${editReq.docName}</td>
                     `
                     row.dataset.editReq = JSON.stringify(editReq);
                     [...row.querySelectorAll('.editreq_sel_help_a, .editreq_sel_help_b')].forEach(v => v.addEventListener('click', evt => {
                        let a = [...container.querySelectorAll('.editreq_sel_help_a')].filter(i => i.checked)[0] || null,
                           b = [...container.querySelectorAll('.editreq_sel_help_b')].filter(i => i.checked)[0] || null;
                        if(a === null || b === null)
                           return;
                        let indexA = [...container.querySelector('table tbody').childNodes].indexOf(a.parentNode.parentNode),
                           indexB = [...container.querySelector('table tbody').childNodes].indexOf(b.parentNode.parentNode);
                        if (indexA > indexB) {
                           let tmp = indexA;
                           indexA = indexB;
                           indexB = tmp;
                        }
                        for(let i = indexA; i <= indexB; i++) {
                           let editReqRow = container.querySelectorAll('table tbody tr')[i];
                           editReqRow.querySelector('.editreq_sel').checked = true;
                        }
                        a.checked = false;
                        b.checked = false;
                     }));
                     container.querySelector('.editreqs tbody').appendChild(row);
                  }
               });
            });
         };
         win.title('편집요청 일괄 닫기 도구');
         win.content(container => {
            container.innerHTML = `
            닫기 사유 : <input class="closeReason" type="input"></input><br>
            <input class="doBlock" type="checkbox"></input>편집 요청을 닫은 후 일괄 차단 창 표시 (편집 요청 작성자들이 자동입력됩니다)<br>
            ※ 참고 : 닫기 버튼은 창을 닫는 버튼입니다.<br>
            <br>
            <table class="table editreqs">
            <thead>
            <tr>
            <td colspan="3">선택</td>
            <td>번호</td>
            <td>문서 제목</td>
            </tr>
            <tbody>
            </tbody>
            </thead>
            </table>
            `
            container.querySelector('.closeReason').value = SET.defaultEditRequestCloseReason;
            container.querySelector('.enterEasily', evt => {
               evt.preventDefault();
               enterTimespanPopup(span => {
                  if (span !== null)
                     container.querySelector('.blockDuration').value = span;
               })
            });
            getSelectedEditReqs = () => {
               return [...container.querySelectorAll('.editreq_sel')].filter(i => i.checked).map(i => JSON.parse(i.parentNode.parentNode.dataset.editReq));
            };
            getCloseInfo = () => {
               return {
                  closeReason : container.querySelector('.closeReason').value,
                  doBlock: container.querySelector('.doBlock').checked
               };
            }
            refreshEditReqs();
         });
         win.button('닫기', win.close);
         win.button('선택한 요청 닫기', () => {
            let editReqs = getSelectedEditReqs(), {closeReason, doBlock} = getCloseInfo(), authors = [];
            let waitingWin = TooSimplePopup();
            waitingWin.title('진행중');
            waitingWin.content(el => el.innerHTML = '진행중입니다.');
            async.eachLimit(editReqs, SET.adminReqLimit, (i, cb) => {
               namuapi.closeEditRequest(i.no, 
                  {
                     reason:closeReason, 
                     identifier: (ENV.IsLoggedIn ? "m" : "i") + ":" + ENV.UserName
                  }, (err, author) => {
                     if (err)
                        cb(err);
                     else {
                        authors.push(author);
                        cb(null);
                     }
                  });
            }, err => {
               if (err) {
                  waitingWin.content(el => el.textContent = `편집 요청을 닫는 중 오류가 발생했습니다: ${err}`);
                  waitingWin.button('닫기', waitingWin.close);
               } else {
                  waitingWin.close();
                  if (doBlock)
                     batchBlockFunction(new Event('blah'), {blockees: authors.filter((v, i, a) => a.indexOf(v) === i)});
               }
               refreshEditReqs();
            });
         });
         win.button('새로고침', refreshEditReqs);
      }
   }
   async function mainFunc() {
      // 환경 감지
      var ENV = {};
      ENV.skinName = /(senkawa|Liberty|buma|vector)/i.exec(document.body.className)[1].toLowerCase();
      ENV.IsSSL = /^https/.test(location.href);
      ENV.IsEditing = location.pathname.toLowerCase()
         .indexOf('/edit/') == 0;
      ENV.Discussing = location.pathname.toLowerCase()
         .indexOf('/thread/') == 0;
      ENV.IsDocument = location.pathname.toLowerCase()
         .indexOf('/w/') == 0; //&& document.querySelector('p.wiki-edit-date');
      ENV.IsSettings = location.pathname.toLowerCase()
         .indexOf('/settings/') == 0;
      ENV.IsHistory = location.pathname.toLowerCase()
         .indexOf('/history/') == 0;
      ENV.IsUserContribsPage = /^\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.pathname);
      ENV.IsUploadPage = location.pathname.toLowerCase()
         .indexOf('/upload/') == 0;
      ENV.IsDiff = location.pathname.toLowerCase()
         .indexOf('/diff/') == 0;
      ENV.IsLoggedIn = skinDependency.IsLoggedIn;
      ENV.IsSearch = location.pathname.indexOf('/search/') == 0;
      ENV.IsEditingRequest = /^\/edit_request\/([0-9]+)\/edit/.test(location.pathname);
      ENV.IsEditRequest = /^\/edit_request\/([0-9]+)$/.test(location.pathname);
      ENV.IsWritingRequest = /^\/new_edit_request\/.+/.test(location.pathname);
      ENV.IsIPACL = /^\/admin\/ipacl/.test(location.pathname);
      ENV.IsBoardIPACL = /^\/admin\/boardipacl/.test(location.pathname);
      ENV.IsSuspendAccount = /^\/admin\/boardsuspendaccount/.test(location.pathname);
      ENV.IsBoardSuspendAccount = /^\/admin\/suspend_account/.test(location.pathname);
      ENV.IsBlockHistory = /^\/BlockHistory/.test(location.pathname);
      ENV.IsRecentChanges = location.pathname.indexOf('/RecentChanges') == 0;
      ENV.IsRecentDiscuss = location.pathname.indexOf('/RecentDiscuss') == 0;
      if (ENV.IsEditRequest) ENV.EditRequestAuthor = document.querySelector('.wiki-article h3 > a').textContent.trim();
      if (location.pathname.indexOf('/edit_request') == 0) ENV.EditRequestNo = /^\/edit_request\/([0-9]+)/.exec(location.pathname);
      if (ENV.IsLoggedIn) {
         ENV.UserName = skinDependency.UserName;
      }
      if (document.querySelector("input[name=section]")) ENV.section = document.querySelector("input[name=section]")
         .value;
      ENV.docTitle = (function () {
         let title = document.querySelector('.wiki-article h1.title > a') || document.querySelector('.wiki-article h1.title') || document.querySelector('h1.title') || document.querySelector('.title h1');
         return title ? title.textContent.trim() : decodeURIComponent(/^\/[a-zA-Z_]+\/(.+)/.exec(location.pathname)[1]);
      })();
      if (ENV.Discussing) {
         ENV.topicNo = /^\/thread\/([^#]+)/.exec(location.pathname)[1];
         ENV.topicTitle = document.querySelector('.wiki-article h2.wiki-heading')
            .innerHTML.trim();
      }
      if (ENV.IsDiff) {
         //ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
         ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
         ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
      }
      if (ENV.IsSearch) {
         ENV.SearchQuery = decodeURIComponent(location.pathname.substring(8));
      }
      if (nOu(ENV.section)) ENV.section = -2;
      GM.xmlHttpRequest({
         method: "GET",
         url: "https://wtfismyip.com/json",
         onload: function (res) {
            var ip = JSON.parse(res.responseText)
               .YourFuckingIPAddress;
            if (!ENV.IsLoggedIn) ENV.UserName = ip;
            ENV.IPAddress = ip;
         }
      });
      editRequestBlockPopup = editRequestBlockPopup(() => ENV);
      if (ENV.IsEditing || ENV.Discussing || ENV.IsEditingRequest || ENV.IsWritingRequest) {
         if (document.querySelector("textarea") !== null && !document.querySelector("textarea")
            .hasAttribute("readonly")) {
            var rootDiv = document.createElement("div");
            if (ENV.IsEditing || ENV.IsEditingRequest || ENV.IsWritingRequest) {
               // 탭 추가
               var previewTab = document.createElement("div");
               var diffTab = document.createElement("div");
               var initalPreviewTabHTML = '<iframe id="nfPreviewFrame" name="nfPreviewFrame" style="width: 100%; height: 600px; display: block; border: 1px solid black;"></iframe>';
               document.querySelector('textarea')
                  .parentNode.insertBefore(previewTab, document.querySelector('textarea')
                     .nextSibling);
               document.querySelector('textarea')
                  .parentNode.insertBefore(diffTab, document.querySelector('textarea')
                     .nextSibling);
               // 나무위키 자체 편집/미리보기 탭 제거
               document.querySelector('#editForm .nav.nav-tabs')
                  .setAttribute("style", "display:none;");

               function hideAndShow(no) {
                  rootDiv.style.display = no == 0 ? '' : 'none';
                  previewTab.style.display = no == 1 ? '' : 'none';
                  diffTab.style.display = no == 2 ? '' : "none";
               }
               hideAndShow(0);
               var tabs = makeTabs();
               tabs.tab("편집")
                  .selected()
                  .click(function () {
                     hideAndShow(0);
                  });
               tabs.tab("미리보기")
                  .click(function () {
                     previewTab.innerHTML = initalPreviewTabHTML;
                     hideAndShow(1);
                     var form = document.querySelector('form#editForm');
                     form.setAttribute("method", "POST");
                     form.setAttribute("target", "nfPreviewFrame");
                     form.setAttribute("action", "/preview/" + ENV.docTitle);
                     form.submit();
                  });
               tabs.tab("비교")
                  .click(function () {
                     hideAndShow(2);
                     diffTab.innerHTML = '<span style="font-size: 15px;">처리중입니다...</span>';
                     var editUrl = 'https://' + location.host + (ENV.IsWritingRequest ? '/new_edit_request/' : '/edit/')
                        .concat(ENV.docTitle, ENV.section != -2 ? '?section='.concat(ENV.section) : '');
                     if (ENV.IsEditingRequest) editUrl = location.href; // 귀찮음....
                     namuapi.theseedRequest({
                        url: editUrl,
                        method: "GET",
                        onload: function (res) {
                           var parser = new DOMParser();
                           var doc = parser.parseFromString(res.responseText, "text/html");
                           var token = doc.querySelector('input[name="token"]')
                              .value;
                           //update edit token
                           document.querySelector('input[name="token"]')
                              .value = token;
                           if (doc.querySelectorAll('textarea')
                              .length < 1) {
                              diffTab.innerHTML = '<span style="font-size: 15px; color:red;">오류가 발생했습니다.</span>';
                              return;
                           }
                           var remoteWikitext = doc.querySelector('textarea')
                              .value;
                           var wikitext = document.querySelector("textarea.NamaEditor.NETextarea")
                              .value;
                           diffTab.innerHTML = '<div style="width: 100%;">' + '<div style="padding: 0; width: 100%; margin: 0px; max-height: 600px; overflow: scroll;" id="diffResult">' + '</div>' + '</div>';
                           var result = diffTab.querySelector('#diffResult');
                           var base = difflib.stringAsLines(remoteWikitext);
                           var newtxt = difflib.stringAsLines(wikitext);
                           // create a SequenceMatcher instance that diffs the two sets of lines
                           var sm = new difflib.SequenceMatcher(base, newtxt);
                           var opcodes = sm.get_opcodes();
                           while (result.firstChild) result.removeChild(result.firstChild);
                           result.appendChild(diffview.buildView({
                              baseTextLines: base,
                              newTextLines: newtxt,
                              opcodes: opcodes,
                              // set the display titles for each resource
                              baseTextName: "리비전 r" + document.querySelector('input[name="baserev"]')
                                 .value,
                              newTextName: "편집중",
                              contextSize: 3,
                              viewType: 2
                           }));
                        }
                     });
                  });
               document.querySelector("#editForm")
                  .insertBefore(tabs.get(), document.querySelector("#editForm")
                     .firstChild);
            }
            // Init (Add Elements)
            var buttonBar = document.createElement('div');
            var txtarea = document.createElement('textarea');
            buttonBar.className = 'NamaEditor NEMenu';
            txtarea.className = 'NamaEditor NETextarea'
            txtarea.name = document.querySelector("textarea")
               .name;
            rootDiv.className += ' NamaEditor NERoot';
            rootDiv.appendChild(buttonBar);
            rootDiv.appendChild(txtarea);
            // Functions To Design
            var Designer = createDesigner(buttonBar);
            // Functions To Process
            var TextProc = createTextProcessor(txtarea);
            // Some Basic MarkUp Functions
            function FontSizeChanger(isIncrease) {
               var pattern = /^{{{([\+-][1-5]) (.+?)}}}$/;
               var t, s = TextProc.selectionStart();
               if (TextProc.selectionTest(pattern)) {
                  var t = TextProc.selectionText();
                  var fontSize = t.replace(pattern, '$1');
                  var innerText = t.replace(pattern, '$2');
                  if (isIncrease) fontSize++;
                  else fontSize--;
                  if (fontSize == 0)
                     fontSize = isIncrease ? 1 : -1;
                  if (5 < fontSize) fontSize = 5;
                  if (fontSize < -5) fontSize = -5;
                  if (fontSize > 0) fontSize = '+' + fontSize;
                  t = '{{{' + fontSize + ' ' + innerText + '}}}';
               } else {
                  t = '{{{' + (isIncrease ? '+1' : '-1') + ' ' + TextProc.selectionText() + '}}}';
               }
               TextProc.selectionText(t);
               TextProc.select(s, s + t.length);
            }

            function NewHeadingMacro() {
               var headingPattern = /^(=+) (.+?) (=+)$/;

               function repeatString(str, count) {
                  var r = "";
                  for (var i = 0; i < count; i++) r += str;
                  return r;
               }
               if (TextProc.selectionTest(headingPattern)) {
                  var matches = headingPattern.exec(TextProc.selectionText());
                  var headingLevel, headingLevel_Left = matches[1].length,
                     headingContent = matches[2],
                     headingLevel_Right = matches[3].length;
                  if (headingLevel_Left != headingLevel_Right) {
                     // normalize
                     TextProc.selectionText(repeatString("=", headingLevel_Left) + " " + headingContent + " " + repeatString("=", headingLevel_Left));
                     return;
                  } else {
                     headingLevel = headingLevel_Left;
                     if (headingLevel < 6) headingLevel++;
                     else if (headingLevel == 6) headingLevel = 1;
                     else if (headingLevel > 6) headingLevel = 6;
                     TextProc.selectionText(repeatString("=", headingLevel) + " " + headingContent + " " + repeatString("=", headingLevel));
                     return;
                  }
               } else if (TextProc.selectionText()
                  .length == 0) {
                  TextProc.selectionText("\n== 제목 ==\n")
                  TextProc.selectionStart(TextProc.selectionStart() + 1);
                  TextProc.selectionEnd(TextProc.selectionEnd() - 1);
               } else if (TextProc.selectionText()
                  .length != 0) {
                  TextProc.selectionText("\n== " + TextProc.selectionText()
                     .replace(/\n/mg, '[br]') + " ==\n")
                  TextProc.selectionStart(TextProc.selectionStart() + 1);
                  TextProc.selectionEnd(TextProc.selectionEnd() - 1);
               }
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
               } else if (TextProc.selectionText()
                  .lengh == 0) {
                  // 선택된 텍스트 없음
                  text = '내용';
               } else {
                  // 텍스트 선택됨
                  text = TextProc.selectionText();
               }
               var w = window.TooSimplePopup();
               var c = w.close;
               w.title('색 지정')
                  .content(function (e) {
                     var pickerWrapper = document.createElement('div');
                     var sliderWrapper = document.createElement('div');
                     var picker = document.createElement('div');
                     var slider = document.createElement('div');
                     var pickerIndicator = document.createElement('div');
                     var sliderIndicator = document.createElement('div');
                     var colorPreview = document.createElement('div');
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
                     colorPreview.className = "NamaEditor FlexiColorPicker ColorPreview";
                     ColorPicker.fixIndicators(sliderIndicator, pickerIndicator);
                     ColorPicker(slider, picker, function (hex, hsv, rgb, pickerCo, sliderCo) {
                           ColorPicker.positionIndicators(sliderIndicator, pickerIndicator, sliderCo, pickerCo);
                           color = hex;
                           var reversedColor = {
                              r: 255 - rgb.r,
                              g: 255 - rgb.g,
                              b: 255 - rgb.b
                           };
                           colorPreview.style.background = `rgb(${reversedColor.r}, ${reversedColor.g}, ${reversedColor.b})`;
                           colorPreview.style.color = color;
                           colorPreview.innerText = color;
                        })
                        .setHex(color);
                     e.appendChild(pickerWrapper);
                     e.appendChild(sliderWrapper);
                     e.appendChild(colorPreview);
                  })
                  .button('지정', function () {
                     TextProc.selectionText('{{{' + color + ' ' + text + '}}}');
                     c();
                  })
                  .button('닫기', c);
            }
            // Add Basic MarkUp Buttons
            var decoDropdown = Designer.dropdown('<span class="ion-wand fa fa-magic"></span>')
               .hoverMessage('텍스트 꾸미기');
            decoDropdown.button('<strong>A</strong>', '굵게')
               .click(function () {
                  TextProc.ToggleWrapSelection("'''");
               });
            decoDropdown.button('<em>A</em>', '기울임꼴')
               .click(function () {
                  TextProc.ToggleWrapSelection("''");
               });
            decoDropdown.button('<del>A</del>', '취소선')
               .click(function () {
                  TextProc.ToggleWrapSelection("--");
               });
            decoDropdown.button('<span style="text-decoration: underline;">A</span>', '밑줄')
               .click(function () {
                  TextProc.ToggleWrapSelection("__");
               });
            decoDropdown.button('<span style="color:red;">A</span>', '글씨색')
               .click(TextColorChange);
            decoDropdown.button('-', '글씨 작게')
               .click(function () {
                  FontSizeChanger(false);
               });
            decoDropdown.button('+', '글씨 크게')
               .click(function () {
                  FontSizeChanger(true);
               });
            // Insertable Media Functions
            function namuUpload(present_files, present_finisher) {
               if (typeof present_files === 'undefined' || present_files.screenX) var present_files = null;
               if (typeof present_finisher === 'undefined') var present_finisher = function () {};

               function getCopyrightInfo(callback) {
                  var win = TooSimplePopup();
                  var contelem;
                  win.title("저작권 정보");
                  win.content(function (el) {
                     contelem = el;
                     el.innerHTML = '<label>출처</label><input type="text" class="cpinfo" data-name="출처"></input><br>' + '<label>날짜</label><input type="text" class="cpinfo" data-name="날짜"></input><br>' + '<label>저작자</label><input type="text" class="cpinfo" data-name="저작자"></input><br>' + '<label>저작권</label><input type="text" class="cpinfo" data-name="저작권"></input><br>' + '<label>기타</label><input type="text" class="cpinfo" data-name="기타"></input><br>' + '<label>설명</label><input type="text" class="cpinfo" data-name="설명"></input>' + '<p>라이선스, 분류는 구현하기 귀찮습니다. 라이선스는 저작권란에 알아서 써주시고 분류는 알아서 하세요.</p>'
                  });
                  win.button("삽입", function () {
                     var result = "== 기본 정보 ==\n";
                     var cpinfos = contelem.querySelectorAll(".cpinfo");
                     for (var i = 0; i < cpinfos.length; i++) {
                        var cpinfo = cpinfos[i];
                        result += "|| " + cpinfo.dataset.name + " || " + cpinfo.value + " ||\n";
                     }
                     result += `\n\n== 기타 ==\n[[NamuFix]] ${GM.info.script.version} 버전을 이용하여 업로드된 이미지입니다.`;
                     callback(result);
                  });
                  win.button("닫기", win.close);
               }
               getCopyrightInfo(function (docuText) {
                  function getFileCallback(files, finish) {
                     if (files.length == 0) {
                        alert('선택된 파일이 없습니다');
                        return finish();
                     }
                     let uploadLimit = SET.fileUploadReqLimit || 3;
                     let win = TooSimplePopup();
                     win.title('업로드 중...');
                     win.content(el => el.innerHTML = `현재 ${uploadLimit}개의 이미지들을 동시에 업로드하고 있습니다. 설정에서 변경가능합니다.<br><ul><li>현재 진행중</li><li><ul id="inprog"></ul></li></ul>`);
                     async.mapLimit(files, uploadLimit, (file, callback) => {
                        if (!file) callback(null, null);
                        var fn = "파일:" + SHA256(String(Date.now()) + file.name)
                           .substring(0, 6) + "_" + file.name;
                        if (SET.unprefixedFilename) {
                           fn = "파일:" + file.name;
                        }
                        if (/\.[A-Z]+$/.test(fn)) {
                           var fnSplitted = fn.split('.');
                           fnSplitted[fnSplitted.length - 1] = fnSplitted[fnSplitted.length - 1].toLowerCase();
                           fn = fnSplitted.join('.');
                        } else if (/\.jpeg$/i.test(fn)) {
                           return callback(null, {
                              success: false,
                              reason: '확장자가 jpeg인 경우 오류가 발생합니다. jpg로 변경해주세요.',
                              name: file.name
                           });
                        }
                        var uploadImageParams = {
                           file: file,
                           fn: fn,
                           docuText: docuText,
                           log: "NamuFix " + GM.info.script.version + "버전으로 자동 업로드됨.",
                           identifier: (ENV.IsLoggedIn ? "m" : "i") + ":" + ENV.UserName
                        };
                        let currentListItem = document.createElement("li");
                        currentListItem.textContent = `${file.name} -> ${fn}`;
                        win.content(el => el.querySelector('ul#inprog')
                           .appendChild(currentListItem));
                        namuapi.uploadImage(uploadImageParams, function (err, resultName) {
                           if (err === null) {
                              callback(null, {
                                 success: true,
                                 name: file.name,
                                 docName: resultName
                              });
                           } else if (err === "recaptcha_required") {
                              namuapi.resolveRecaptcha(function (res) {
                                 if (res == null) {
                                    alert('reCAPTCHA를 입력하지 않아 건너뜁니다.');
                                    callback(null, {
                                       success: false,
                                       reason: 'reCAPTCHA를 입력하지 않았습니다.',
                                       name: file.name
                                    });
                                    return;
                                 }
                                 uploadImageParams.recaptchaKey = res;
                                 namuapi.uploadImage(uploadImageParams, (err, resultName) => {
                                    if (err === null) {
                                       callback(null, {
                                          success: true,
                                          name: file.name,
                                          docName: resultName
                                       });
                                    } else if (err === "recaptcha_required") {
                                       callback(null, {
                                          success: false,
                                          reason: 'reCAPTCHA를 해결하였으나 다시 한번 더 요구받았습니다.',
                                          name: file.name
                                       });
                                    } else if (err === "html_error") {
                                       callback(null, {
                                          success: false,
                                          reason: '예상하지 못한 오류입니다. 자세한 정보를 다운로드하여 NamuFix 이슈트래커에 제보해주세요.',
                                          name: file.name,
                                          data: resultName
                                       });
                                    } else {
                                       callback(null, {
                                          success: false,
                                          reason: '알 수 없는 오류입니다.',
                                          name: file.name
                                       });
                                    }
                                 });
                              });
                           } else if (err === "html_error") {
                              callback(null, {
                                 success: false,
                                 reason: '예상하지 못한 오류입니다. 자세한 정보를 다운로드하여 NamuFix 이슈트래커에 제보해주세요.',
                                 name: file.name,
                                 data: resultName
                              });
                           } else {
                              callback(null, {
                                 success: false,
                                 reason: '알 수 없는 오류입니다.',
                                 name: file.name
                              });
                           }
                           win.content(el => el.querySelector('ul#inprog')
                              .removeChild(currentListItem));
                        });
                     }, (err, results) => {
                        if (err) {
                           alert('오류가 발생했습니다.');
                           console.error("[NamuFix] 이미지 업로드 중 오류가 발생했습니다.");
                           console.error(err);
                           return;
                        }
                        finish();
                        win.close();
                        results = results.filter(v => v !== null);
                        let hasError = false;
                        let imgLinks = '';
                        for (i of results) {
                           if (i.success) {
                              imgLinks += '[[' + i.docName + ']]';
                           } else {
                              hasError = true;
                           }
                        }
                        if (imgLinks.length != 0) TextProc.selectionText(TextProc.selectionText() + imgLinks);
                        if (hasError) {
                           let win = TooSimplePopup();
                           win.title('이미지 업로드 오류');
                           win.content(el => {
                              el.innerHTML = '<p>오류들이 발생했습니다.</p><ul></ul>';
                              for (let i of results.filter(v => !v.success)) {
                                 let li = document.createElement("li");
                                 li.textContent = `${i.name} : ${i.reason}`;
                                 if (i.data) li.innerHTML += ` <a href="${URL.createObjectURL(new Blob(i.data, 'text/html'))}" download="log.html">(자세한 정보 다운로드)</a>`
                                 el.querySelector('ul')
                                    .appendChild(li);
                              }
                           })
                           win.button('닫기', win.close);
                        }
                     })
                  }
                  if (present_files != null) {
                     getFileCallback(present_files, present_finisher);
                  } else {
                     getFile(getFileCallback, true);
                  }
               })
            }

            function InsertYouTube() {
               var win = TooSimplePopup();
               win.title('YouTube 동영상 삽입');
               win.content(function (el) {
                  el.innerHTML = '<p style="background: purple; box-shadow: 1px 0px 1px gray; color:white; padding: 8px; border-radius: 3px; margin-bottom: 5px;">YouTube 동영상을 검색하거나 동영상 주소를 입력하여 YouTube 동영상을 삽입할 수 있습니다.</p>' + '<p><label for="vidUrl" style="width: 120px; display: inline-block;">YouTube 동영상 주소</label><input type="text" name="vidUrl" id="vidUrl" style="width:620px; max-width: 100vw;"></input><button id="insertUrl">삽입</button></p>' + '<hr>' + '<div>' + '<label for="vidQuery" style="width: 120px; display: inline-block;">검색어</label><input type="text" name="vidQuery" id="vidQuery" style="width:620px; max-width: 100vw;"></input><button id="searchVids">검색</button>' + '<div id="results" style="overflow-y: scroll; overflow-x: hidden; width: 820px; max-width: 100vw; height: 400px; max-height: calc(100vh - 300px);"><span style="color:red">검색 결과가 없습니다.</span></div>' + '</div>';
               })
               var finish = function (vid) {
                  if (vid == null) {
                     alert('무언가 잘못된것 같습니다.');
                     return;
                  }
                  TextProc.selectionText(TextProc.selectionText() + '[youtube(' + vid + ')]');
                  win.close();
               }
               // 주소로 삽입 기능
               win.content(function (el) {
                  var ExtractYouTubeID = function (url) {
                     // from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
                     var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                     var match = url.match(regExp);
                     if (match && match[7].length == 11) return match[7];
                     else return null;
                  }
                  var insertByUrlFunc = function () {
                     var url = el.querySelector('#vidUrl')
                        .value;
                     var vidId = ExtractYouTubeID(url);
                     finish(vidId);
                  }
                  el.querySelector('#insertUrl')
                     .addEventListener('click', insertByUrlFunc);
                  el.querySelector('#vidUrl')
                     .addEventListener('keyup', function (evt) {
                        if (evt.which == 13 || evt.keycode == 13) {
                           insertByUrlFunc();
                           return false;
                        }
                     })
               });
               // 검색 기능
               win.content(function (el) {
                  // https://developers.google.com/youtube/v3/docs/search/list
                  var vidSearchFunc = function () {
                     var q = el.querySelector('#vidQuery')
                        .value;
                     var resultDiv = el.querySelector('#results');
                     resultDiv.innerHTML = '<span style="color:orange;">검색중입니다.</span>'
                     GM.xmlHttpRequest({
                        method: "GET",
                        url: 'https://namufix.wikimasonry.org/youtube/search?q=' + encodeURIComponent(q),
                        onload: function (res) {
                           var jobj = JSON.parse(res.responseText);
                           resultDiv.innerHTML = '<ul></ul>';
                           var ul = resultDiv.querySelector('ul');
                           if (res.status != 200 || !jobj.success) {
                              resultDiv.innerHTML = '<span style="color:red;">검색중 오류가 발생했습니다.</span>';
                              return;
                           }
                           for (var i = 0; i < jobj.items.length; i++) {
                              var vidNow = jobj.items[i];
                              var li = document.createElement("li");
                              li.height = '90px';
                              li.innerHTML = '<img style="height: 90px;" src="//namufix.wikimasonry.org/youtube/thumb/' + vidNow.id.videoId + '"></img>' + '<div style="position: relative; display: inline-block; margin-left: 5px; overflow: hidden; width: 670px; max-width: 100vw;">' + '<span style="font-weight: bold; font-size: 12pt; margin-bottom: 3px;">' + vidNow.snippet.title + '</span><button name="insertThis" class="moreFlat">삽입</button><button name="preview" class="moreFlat">미리보기</button><br><span style="font-size:10pt;">' + vidNow.snippet.description + '</span>' + '</div>';
                              li.querySelector('[name="preview"]')
                                 .parentNode.dataset.videoId = vidNow.id.videoId;
                              li.querySelector('[name="preview"]')
                                 .addEventListener('click', function (evt) {
                                    var previewWin = TooSimplePopup();
                                    previewWin.title('미리보기');
                                    previewWin.content(function (el) {
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
                              li.querySelector('[name="insertThis"]')
                                 .addEventListener('click', function (evt) {
                                    finish(evt.target.parentNode.dataset.videoId);
                                 })
                              ul.appendChild(li);
                           }
                        }
                     });
                  };
                  el.querySelector('#searchVids')
                     .addEventListener('click', vidSearchFunc);
                  el.querySelector('#vidQuery')
                     .addEventListener('keyup', function (evt) {
                        if (evt.which == 13 || evt.keycode == 13) {
                           vidSearchFunc();
                           return false;
                        }
                     })
                  el.querySelector('#vidUrl')
                     .focus();
               })
               win.button('닫기', win.close);
            }

            function MapMacro() {
               // title(text), content(callback), foot(callback), button(text,onclick), close
               var win = TooSimplePopup();
               win.title("지도 삽입");
               win.content(function (el) {
                  var mapDiv = document.createElement("div");
                  mapDiv.id = "NFMapDiv";
                  mapDiv.style.maxHeight = "calc(100vh - 100px)";
                  mapDiv.style.maxWidth = "100vw";
                  mapDiv.style.height = '480px';
                  mapDiv.style.width = '640px';
                  el.appendChild(mapDiv);
                  var initFuncContext = 'var NFMap;\n' + 'function NFMapInit(){\n' + 'var firstLocation=new google.maps.LatLng(37.46455,126.67435);\n' + 'var mapOptions={\n' + 'zoom: 8,\n' + 'center: firstLocation\n,' + 'streetViewControl: false\n' + '};\n' + 'NFMap=new google.maps.Map(document.querySelector("#NFMapDiv"),mapOptions);\n' + '}';
                  var onloadScript = document.createElement("script");
                  onloadScript.innerHTML = initFuncContext;
                  el.appendChild(onloadScript);
                  setTimeout(function () {
                     var mapsAPILib = document.createElement("script");
                     mapsAPILib.setAttribute("src", "//maps.googleapis.com/maps/api/js?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&callback=NFMapInit");
                     el.appendChild(mapsAPILib);
                  }, 500);
               });
               win.button("삽입", function () {
                  var lat = unsafeWindow.NFMap.getCenter()
                     .lat();
                  var lng = unsafeWindow.NFMap.getCenter()
                     .lng();
                  var zoom = unsafeWindow.NFMap.getZoom();
                  TextProc.selectionText(TextProc.selectionText() + ' [Include(틀:지도,장소=' + lat + '%2C' + lng + ',zoom=' + zoom + ')] ');
                  win.close();
               })
               win.button("닫기", win.close);
            }
            // Add Insertable Things
            var insertablesDropDown = Designer.dropdown('<span class="ion-paperclip fa fa-paperclip"></span>')
               .hoverMessage('삽입 가능한 미디어');
            insertablesDropDown.button('<span class="ion-social-youtube fa fa-youtube-play" style="color:red;"></span>', 'YouTube 동영상')
               .click(InsertYouTube);
            insertablesDropDown.button('<span class="ion-map fa fa-map"></span>', '지도')
               .click(MapMacro);
            insertablesDropDown.button('<span class="ion-images fa fa-picture-o" style="color: #008275;"></span>', '이미지 업로드')
               .click(namuUpload);
            Designer.button('<span class="ion-ios-grid-view fa fa-table"></span>')
               .hoverMessage('간단한 표 만들기')
               .click(function () {
                  var numbers = prompt('행과 열을 행숫x열숫 형태로 입력해주세요. 예시: 2x3, 2*3')
                  if (/([0-9]+).([0-9]+)/.test(numbers)) {
                     var num_matches = /([0-9]+).([0-9]+)/.exec(numbers)
                     numbers = [parseInt(num_matches[1]), parseInt(num_matches[2])];
                  } else {
                     alert('입력이 올바르지 않습니다.');
                     return;
                  }
                  var win = TooSimplePopup();
                  win.title('간단한 표 만들기');
                  win.content(function (container) {
                     // cell: align( left=(, center=:, right=) ), rowspan (^|0-9 |0-9 v|0-9), colspan bgcolor, width, height
                     // row: rowbgcolor
                     // table: align, bgcolor, bordercolor, width
                     container.innerHTML = '<strong>현재 실험중인 기능입니다. 불안정할 수 있습니다.</strong><br>표를 만듭니다.... 공대 감성을 듬뿍 담아 디자인했습니다.<br>칸 안에는 나무마크 위키텍스트를 입력하면 됩니다.<br>Ctrl + 화살표 단축키로 칸 사이를 이동할 수 있습니다.' + '<style>#target-table td {border: 1px solid #dddddd; padding: 5px 10px} #target-table tr {background-color: #f5f5f5 border-collapse: collapse;}</style>' + '<table id="target-table"></table>' + '<div style="display: none;"><button id="disableShortcut" onclick="window.namu.disableShortcutKey=true;"></button><button id="enableShortcut" onclick="window.namu.disableShortcutKey=false;"></button></div>';
                     var table = container.querySelector('table');
                     document.querySelector('#disableShortcut')
                        .click();
                     for (var i = 0; i < numbers[1]; i++) {
                        var row = document.createElement("tr");
                        for (var j = 0; j < numbers[0]; j++) row.innerHTML += '<td contenteditable="true">&nbsp;</td>';
                        var cols = row.querySelectorAll('td');
                        for (var j = 0; j < cols.length; j++) {
                           cols[j].addEventListener('keyup', function (evt) {
                              var doPreventDefault = true;
                              var cellOrder = [].indexOf.call(evt.target.parentNode.querySelectorAll('td'), evt.target);
                              if (evt.key == "ArrowDown" && evt.ctrlKey) {
                                 var nearCols = evt.target.parentNode.nextElementSibling.querySelectorAll('td');
                                 nearCols[cellOrder < nearCols.length ? cellOrder : 0].focus();
                              } else if (evt.key == "ArrowUp" && evt.ctrlKey) {
                                 var nearCols = evt.target.parentNode.previousElementSibling.querySelectorAll('td');
                                 nearCols[cellOrder < nearCols.length ? cellOrder : 0].focus();
                              } else if (evt.key == "ArrowRight" && evt.ctrlKey) {
                                 evt.target.nextSibling.focus();
                              } else if (evt.key == "ArrowLeft" && evt.ctrlKey) {
                                 evt.target.previousSibling.focus();
                              } else {
                                 doPreventDefault = false;
                              }
                              if (doPreventDefault) evt.preventDefault();
                           });
                        }
                        table.appendChild(row);
                     }
                     win.button('닫기', function () {
                        document.querySelector('#enableShortcut')
                           .click();
                        win.close();
                     });
                     win.button('삽입', function () {
                        var rows = table.querySelectorAll('tr');
                        var result = '';
                        for (var i = 0; i < rows.length; i++) {
                           result += '||';
                           var cols = rows[i].querySelectorAll('td');
                           for (var j = 0; j < cols.length; j++) {
                              result += cols[j].textContent + '||';
                           }
                           result += '\n';
                        }
                        TextProc.selectionText(TextProc.selectionText() + '\n' + result);
                        document.querySelector('#enableShortcut')
                           .click();
                        win.close();
                     });
                  });
               })
            Designer.button('<span class="ion-checkmark-round fa fa-check"></span>')
               .hoverMessage('맞춤법 검사기')
               .click(function () {
                  var win = TooSimplePopup();
                  win.title('나사 빠진 맞춤법 검사기');
                  win.content(function (el) {
                     el.innerHTML = "진행중입니다...."
                  });
                  var textToCheck = TextProc.selectionText()
                     .length == 0 ? TextProc.value() : TextProc.selectionText();
                  GM.xmlHttpRequest({
                     url: 'https://namufix.wikimasonry.org/kospell',
                     method: 'POST',
                     data: JSON.stringify({
                        text: textToCheck,
                        unstripNamumark: true
                     }),
                     headers: {
                        "Content-Type": "application/json"
                     },
                     onload: function (res) {
                        try {
                           var resObj = JSON.parse(res.responseText);
                           if (!resObj.success) {
                              alert('서버에서 오류가 발생했습니다.\n\n오류 코드 : ' + resObj.error.code + '\n메세지 : ' + resObj.error.message);
                              win.close();
                              return;
                           }
                        } catch (errr) {
                           alert('서버에서 알 수 없는 오류가 발생했습니다.');
                           win.close();
                           return;
                        }
                        win.content(function (winel) {
                           winel.innerHTML = '<p>맞춤법 검사 결과입니다. 아직 개발중인 기능이라 나사 빠진듯이 돌아갑니다.</p><style>table.spellresult tbody td, tr {border: #9D75D9 1px solid; border-collapse: collapse;}table.spellresult tbody td:not(.spellhelp) {padding: 3px 7px;word-break: keep-all; white-space: nowrap;}table.spellresult tbody td.spellhelp {word-break: keep-all;}table.spellresult tbody td.spellerror {color: red;}table.spellresult tbody td.spellsuggest {color: darkgreen;}</style><table class="spellresult"><thead><tr><th>틀린말</th><th>대체어</th><th>도움말</th></tr></thead><tbody></tbody></table>';
                           for (var i = 0; i < resObj.result.length; i++) {
                              var resultEntry = resObj.result[i];
                              var row = document.createElement('tr');
                              row.innerHTML = '<td class="spellerror"></td><td class="spellsuggest"></td><td class="spellhelp"></td>';
                              row.querySelector('.spellerror')
                                 .innerHTML = resultEntry.errors.join('<br>');
                              row.querySelector('.spellsuggest')
                                 .innerHTML = resultEntry.replacements.join('<br>');
                              row.querySelector('.spellhelp')
                                 .innerHTML = encodeHTMLComponent(resultEntry.help);
                              winel.querySelector('tbody')
                                 .appendChild(row);
                           }
                        });
                        win.button('닫기', win.close);
                     }
                  })
               });
            Designer.button('<span class="ion-ios-timer-outline fa fa-clock-o"></span>')
               .hoverMessage('아카이브하고 외부링크 삽입')
               .click(function () {
                  var win = TooSimplePopup();
                  win.title("아카이브한 후 외부링크 삽입");
                  var linkTo = "",
                     linkText = "",
                     WayBack = false,
                     WayBack = false,
                     WayBackAsMobile = false,
                     archiveIs = false,
                     archiveLinks = [];
                  var refresh;
                  win.content(function (container) {
                     container.innerHTML = '<h1 style="margin: 0px 0px 5px 0px; font-size: 20px;">링크할 곳(외부링크)</h1>' + '<style>#linkTo, #visibleOutput {position: absolute; left: 120px;}</style>' + '<label>링크할 대상</label> <input type="text" id="linkTo" placeholder="e.g. http://www.naver.com" /><br>' + '<label>표시할 텍스트 (출력)</label> <input type="text" id="visibleOutput" placeholder="e.g. 구글" /><br>' + '<h1 style="margin: 5px 0px 5px 0px; font-size: 20px;">아카이브</h1>' + '<strong>참고</strong> : 동일한 주소의 아카이브를 자주 하다 보면 아까 했던 아카이브가 또 나올 수도 있습니다, 이런 경우엔 잠시 몇분정도 기다렸다가 하시면 됩니다.<br>' + '<strong>참고</strong> : 기존의 아카이브들은 무시됩니다.<br>' + '<strong>참고</strong> : 아카이빙하려는 사이트의 서버 설정 결과에 따라 아카이빙이 거부될 수 있습니다.' + '<strong style="color:red;">주의</strong> : 불안정한 기능입니다. 버그에 주의하세요.<br>' + '<input type="checkbox" id="WayBack" /> <label><a href="https://archive.org/web/" target="_blank">WayBack Machine</a>으로 아카이브</label> (<input type="checkbox" id="WayBackMobi" /> 모바일 버전으로)<br>' + '<input type="checkbox" id="archiveIs" /> <label><a href="https://archive.is/" target="_blank" checked>archive.is</a>에서 아카이브</label>';
                     refresh = function () {
                        linkTo = container.querySelector('#linkTo')
                           .value;
                        linkText = container.querySelector('#visibleOutput')
                           .value;
                        WayBack = container.querySelector('#WayBack')
                           .checked;
                        WayBackAsMobile = container.querySelector('#WayBackMobi')
                           .checked;
                        archiveIs = container.querySelector('#archiveIs')
                           .checked;
                     }
                  });
                  win.button("박제/삽입", function () {
                     var waitwin = TooSimplePopup();
                     waitwin.title('박제중....');
                     refresh();
                     if (linkTo.indexOf('http://') != 0 && linkTo.indexOf('https://') != 0) {
                        alert('http:// 또는 https://로 시작하는 외부링크가 아닙니다!');
                     }
                     waitwin.content(function (container) {
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
                           r.onload = function (res) {
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
                                 alert('WayBack Machine 아카이브 주소를 얻는 데 실패했습니다.');
                                 setTimeout(archiveOne, 50);
                                 return;
                              }
                              var archiveUrl = 'http://web.archive.org' + matches[1];
                              archiveLinks.push(archiveUrl);
                              setTimeout(archiveOne, 50);
                           };
                        } else if (archiveType == 'ai') {
                           r.method = "GET";
                           r.url = "https://archive.is";
                           r.onload = function (res) {
                              // get submitid
                              var parser = new DOMParser();
                              var indexDoc = parser.parseFromString(res.responseText, "text/html");
                              var token = indexDoc.querySelector("input[name=submitid][value]");
                              if (token) {
                                 token = token.value;
                                 // archive form
                                 // 'http://archive.is/submit/'
                                 var r2 = {};
                                 r2.method = "POST";
                                 r2.url = "https://archive.is/submit/";
                                 r2.headers = {};
                                 r2.headers["Content-Type"] = "application/x-www-form-urlencoded";
                                 r2.data = "anyway=1&url=" + encodeURIComponent(linkTo) + "&submitid=" + encodeURIComponent(token);
                                 r2.onload = function (res) {
                                    var matches = /document\.location\.replace\("(.+?)"\)/.exec(res.responseText);
                                    if (matches == null) matches = /<meta property="og:url" content="(.+?)"/.exec(res.responseText);
                                    if (matches == null) {
                                       alert('archive.is 아카이브 주소를 얻는 데 실패했습니다.');
                                       setTimeout(archiveOne, 50);
                                       return;
                                    }
                                    var archiveUrl = matches[1];
                                    archiveLinks.push(archiveUrl);
                                    setTimeout(archiveOne, 50);
                                 }
                                 GM.xmlHttpRequest(r2);
                              } else {
                                 alert('archive.is 아카이브 중 토큰을 얻는 데 실패했습니다.')
                              }
                           }
                        }
                        GM.xmlHttpRequest(r);
                     }
                     archiveOne();
                  });
                  win.button("닫기", win.close);
               });
            if (ENV.IsEditing) {
               // Manager Class
               var tempsaveManager = new function () {
                  var ht = this;
                  this.getTitles = function () {
                     var r = [];
                     for (var i in SET.tempsaves) {
                        r.push(i);
                     }
                     return r;
                  }
                  this.getByTitle = async function (docTitle) {
                     await SET.load();
                     if (nOu(SET.tempsaves[docTitle])) {
                        SET.tempsaves[docTitle] = [];
                        await SET.save();
                     }
                     return SET.tempsaves[docTitle]; // {section, text, timestamp}
                  };
                  this.getByTitleAndSectionNo = async function (docTitle, sectno) {
                     await SET.load();
                     var b = ht.getByTitle(docTitle);
                     var a = [];
                     for (var i = 0; i < b.length; i++) {
                        if (b[i].section == sectno) a.push(b[i]);
                     }
                     return a;
                  }
                  this.save = async function (docTitle, sectno, timestamp, text, wikihost) {
                     if (typeof wikihost === 'undefined') var wikihost = location.host;
                     await SET.load();
                     if (nOu(SET.tempsaves[docTitle])) {
                        SET.tempsaves[docTitle] = [];
                        await SET.save();
                     }
                     SET.tempsaves[docTitle].push({
                        section: sectno,
                        timestamp: timestamp,
                        text: text,
                        host: wikihost
                     });
                     await SET.save();
                  }
                  this.delete = async function (docTitle, sectno, timestamp) {
                     await SET.load();
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
                     await SET.save();
                  }
               }
               // Tempsave Menu
               var tempsaveDropdown = Designer.dropdown('<span class="ion-ios-pricetags-outline fa fa-save"></span>')
                  .hoverMessage('임시저장');
               tempsaveDropdown.button('<span class="ion-ios-pricetag-outline fa fa-save"></span>', '임시저장')
                  .click(async function () {
                     await tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
                  });
               tempsaveDropdown.button('<span class="ion-filing fa fa-folder-open-o"></span>', '임시저장 불러오기')
                  .click(async function () {
                     // title(text), content(callback), foot(callback), button(text,onclick), close
                     var win = TooSimplePopup();
                     win.title('임시저장 불러오기')
                     var tempsaveList = await tempsaveManager.getByTitle(ENV.docTitle);
                     win.content(function (el) {
                        el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.</p>';
                        var divWithscrollbars = document.createElement("div");
                        divWithscrollbars.style.height = '300px';
                        divWithscrollbars.style.overflow = 'auto';
                        var table = document.createElement("table");
                        var headrow = document.createElement("tr");
                        headrow.innerHTML = '<th>문단 번호</th><th>저장된 날짜와 시간</th><th>불러오기 버튼</th>';
                        table.appendChild(headrow);
                        for (var i = 0; i < tempsaveList.length; i++) {
                           var now = tempsaveList[i];
                           var tr = document.createElement("tr");
                           tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + (now.section === -2 ? '전체' : now.section) + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
                           var td = document.createElement("td");
                           var btn = document.createElement("button");
                           btn.setAttribute("type", "button");
                           btn.innerHTML = "불러오기";
                           btn.dataset.json = JSON.stringify(now);
                           btn.addEventListener('click', function (evt) {
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
               tempsaveDropdown.button('<span class="ion-trash-a fa fa-trash" style="color:red;"></span>', '이 문서의 모든 임시저장 삭제')
                  .click(async function () {
                     await tempsaveManager.delete(ENV.docTitle);
                  });
               tempsaveDropdown.button('<span class="ion-trash-a fa fa-trash" style="color:orangered;"></span>', '이 문서의 이 문단의 모든 임시저장 삭제')
                  .click(async function () {
                     await tempsaveManager.delete(ENV.docTitle, ENV.section);
                  });
               tempsaveDropdown.button('<span class="ion-trash-a fa fa-trash" style="color:orange;"></span>', '특정 임시저장만 삭제')
                  .click(async function () {
                     // title(text), content(callback), foot(callback), button(text,onclick), close
                     var win = TooSimplePopup();
                     var tempsaveList = await tempsaveManager.getByTitle(ENV.docTitle);
                     win.title('임시저장 삭제');
                     win.content(function (el) {
                        el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.</p>';
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
                           tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + (now.section === -2 ? '전체' : now.section) + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
                           var td = document.createElement("td");
                           var btn = document.createElement("button");
                           btn.setAttribute("type", "button");
                           btn.innerHTML = "삭제하기";
                           btn.dataset.json = JSON.stringify(now);
                           btn.addEventListener('click', async function (evt) {
                              var now = JSON.parse(evt.target.dataset.json);
                              await tempsaveManager.delete(ENV.docTitle, now.section, now.timestamp);
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
               if (SET.autoTempsaveSpan > 0) setInterval(async function () {
                  await tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
               }, SET.autoTempsaveSpan);
            }
            // Template Insert Feature
            var templatesDropdown = Designer.dropdown('<span class="ion-ios-copy-outline fa fa-file"></span>')
               .hoverMessage('템플릿/틀 삽입과 최근에 사용/삽입한 템플릿/틀 기록');
            var refreshTemplatesDropdown = async function () {
               await SET.load();
               templatesDropdown.clear();
               var rutl = SET.recentlyUsedTemplates.length;

               function InsertTemplateClosure(na) {
                  return async function () {
                     namuapi.raw(na, async function (templateContent) {
                           await SET.load();
                           if (SET.recentlyUsedTemplates.indexOf(na) == -1) SET.recentlyUsedTemplates.push(na);
                           await SET.save();
                           if (na.indexOf('틀:') == 0) TextProc.selectionText(TextProc.selectionText() + '[include(' + na + ')]');
                           else txtarea.value = templateContent;
                           setTimeout(refreshTemplatesDropdown, 300);
                        },
                        function () {
                           alert('존재하지 않는 템플릿/틀입니다.');
                           return;
                        });
                  };
               }
               for (var i = 0; i < (rutl < 9 ? rutl : 9); i++) {
                  templatesDropdown.button('<span class="ion-ios-paper-outline fa fa-file"></span>', SET.recentlyUsedTemplates[i])
                     .click(InsertTemplateClosure(SET.recentlyUsedTemplates[i]));
               }
               templatesDropdown.button('<span class="ion-close-round fa fa-times"></span>', '기록 삭제')
                  .click(async function () {
                     await SET.load();
                     SET.recentlyUsedTemplates = [];
                     await SET.save();
                     setTimeout(refreshTemplatesDropdown, 300);
                  });
               templatesDropdown.button('<span class="ion-plus-round fa fa-plus"></span>', '템플릿/틀 삽입')
                  .click(function () {
                     var templateName = prompt('템플릿/틀 이름을 입력하세요.');
                     if (!/^(?:템플릿|Template|틀):.+/.test(templateName) && !confirm('올바른 템플릿/틀 이름이 아닌 것 같습니다. 계속할까요?')) return;
                     InsertTemplateClosure(templateName)();
                     setTimeout(refreshTemplatesDropdown, 300);
                  });
            };
            setTimeout(refreshTemplatesDropdown, 500);
            // set Size
            if (ENV.Discussing) rootDiv.style.height = '170px';
            else rootDiv.style.height = '600px';
            // Add Keyboard Shortcut
            function overrideBrowserDefaultShortcutKey(evt) {
               var overrideShortcutKey = true;
               if (evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
                  switch (evt.keyCode) { // Ctrl
                  case 66: // B
                  case 98:
                  case 73: // I
                  case 105:
                  case 68: // D
                  case 100:
                  case 85: // U
                  case 117:
                  case 72: // H
                  case 104:
                  case 219:
                  case 123:
                  case 91: // [
                  case 221:
                  case 125:
                  case 93: // ]
                  case 83: // S
                  case 115:
                     break;
                  default:
                     overrideShortcutKey = false;
                     break;
                  }
               } else if (evt.ctrlKey && evt.altKey && !evt.shiftKey) {
                  switch (evt.keyCode) { // Ctrl + Alt
                  case 73: // I
                  case 105:
                  default:
                     overrideShortcutKey = false;
                     break;
                  }
               } else {
                  overrideShortcutKey = false;
               }
               if (overrideShortcutKey) {
                  evt.preventDefault();
                  evt.stopPropagation();
               }
            }
            txtarea.addEventListener('keydown', overrideBrowserDefaultShortcutKey);
            txtarea.addEventListener('keypress', overrideBrowserDefaultShortcutKey);
            txtarea.addEventListener('keyup', function (evt) {
               var overrideShortcutKey = true;
               if (evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
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
                  case 72:
                  case 104:
                     NewHeadingMacro();
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
                  case 83: // S
                  case 115:
                     tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
                     break;
                  default:
                     overrideShortcutKey = false;
                     break;
                  }
               } else if (evt.ctrlKey && evt.altKey && !evt.shiftKey) {
                  switch (evt.keyCode) { // Ctrl + Alt
                  case 73: // I
                  case 105:
                     namuUpload();
                     break;
                  default:
                     overrideShortcutKey = false;
                     break;
                  }
               } else {
                  overrideShortcutKey = false;
               }
               if (overrideShortcutKey) {
                  evt.preventDefault();
                  evt.stopPropagation();
               }
            });
            // Support drag-drop file upload
            // from https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
            // from https://stackoverflow.com/questions/7237436/how-to-listen-for-drag-and-drop-plain-text-in-textarea-with-jquery
            txtarea.addEventListener('dragover', function (evt) {
               evt.preventDefault();
            });
            txtarea.addEventListener('dragend', function (evt) {
               evt.preventDefault();
            });
            txtarea.addEventListener('dragenter', function (evt) {
               evt.preventDefault();
            });
            txtarea.addEventListener('drop', function (evt) {
               evt.preventDefault();
               var dt = evt.dataTransfer;
               var files = [];
               if (dt.items) {
                  for (var i = 0; i < dt.items.length; i++)
                     if (dt.items[i].kind == "file") {
                        var f = dt.items[i].getAsFile();
                        if (f.type.indexOf('image/') == 0) files.push(f);
                     }
               } else {
                  for (var i = 0; i < dt.files.length; i++) {
                     var f = dt.files[i];
                     if (f.type.indexOf('image/') == 0) files.push(f);
                  }
               }
               if (files.length > 0) {
                  namuUpload(files, function () {});
               }
            })
            // Support image upload by pasting
            txtarea.addEventListener('paste', function (evt) {
               var items = (evt.clipboardData || evt.originalEvent.clipboardData)
                  .items;
               var files = [];
               for (index in items) {
                  var item = items[index];
                  if (item.kind === 'file') {
                     var file = item.getAsFile();
                     if (file.type.indexOf('image/') == 0) files.push(file);
                  }
               }
               if (files.length > 0) {
                  namuUpload(files, function () {});
               }
            })
            // Add NamuFix Div
            var oldTextarea = document.querySelector("textarea");
            var wText = oldTextarea.value;
            oldTextarea.parentNode.insertBefore(rootDiv, oldTextarea);
            oldTextarea.parentNode.removeChild(oldTextarea);
            txtarea.value = wText;
            var srwPattern = /\?redirectTo=([^\&]+)/;
            if (srwPattern.test(location.search)) {
               if ((txtarea.value.trim()
                     .search(/^#redirect .+/) == 0 || txtarea.value.trim()
                     .length == 0) || confirm('빈 문서가 아닌것 같습니다만 그래도 계속?')) {
                  txtarea.value = '#redirect ' + decodeURIComponent(srwPattern.exec(location.search)[1]);
                  if (document.querySelectorAll('iframe[title="CAPTCHA 위젯"]')
                     .length == 0 && document.querySelector('.alert.alert-danger') !== null) {
                     if (document.querySelector("input#logInput")) document.querySelector("input#logInput")
                        .value = "NamuFix를 이용하여 자동 리다이렉트 처리됨.";
                     document.querySelector('#editBtn')
                        .click();
                  }
               }
            }
         }
      } else if (ENV.IsDocument) {
         if (ENV.docTitle.trim()
            .indexOf('기여:') == 0) {
            var target = ENV.docTitle.trim()
               .substring(3)
               .trim();
            if (validateIP(target)) {
               location.assign('/contribution/ip/' + target + '/document');
            } else {
               location.assign('/contribution/author/' + target + '/document');
            }
         }
         // 리다이렉트 버튼 추가
         addArticleButton('리다이렉트', function (evt) {
            evt.preventDefault();
            var redirectFrom = prompt('어느 문서에서 지금 이문서로 리다이렉트?');
            if (redirectFrom != null && redirectFrom.trim()
               .length != 0) location.href = 'https://' + location.host + '/edit/' + redirectFrom + '?redirectTo=' + ENV.docTitle;
         });
         if (SET.addSnsShareButton && ENV.IsDocument) {
            addArticleButton('<span class="icon ion-social-facebook fa fab fa-facebook-square"></span>', (evt) => {
               evt.preventDefault();
               GM.openInTab(`http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`)
            })
            addArticleButton('<span class="icon ion-social-twitter fa fab fa-twitter"></span>', (evt) => {
               evt.preventDefault();
               GM.openInTab(`http://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${ENV.docTitle}`)
            })
         }
         // 리다이렉트로 왔을 시 그 라디이렉트 문서 편집/삭제 링크 추가
         if (document.querySelector('.wiki-article .alert.alert-info') && document.querySelector('.wiki-article .alert.alert-info')
            .innerHTML.indexOf('에서 넘어옴') != -1) {
            var redirectAlert = document.querySelector('.wiki-article .alert.alert-info');
            var origDocuName = decodeURIComponent(/\/w\/(.+?)\?noredirect=1/.exec(redirectAlert.querySelector('a.document')
               .href)[1]);
            var editUrl = '/edit/' + origDocuName;
            var deleteUrl = '/delete/' + origDocuName;
            redirectAlert.innerHTML = '<a href="/w/' + encodeURIComponent(origDocuName) + '?noredirect=1" class="document" title="' + encodeHTMLComponent(origDocuName) + '">' + encodeHTMLComponent(origDocuName) + '</a>' + '에서 여기로 넘어왔습니다. 당신은 ' + encodeHTMLComponent(origDocuName) + ' 문서를 <a href="' + editUrl + '">수정</a>하거나 <a href="' + deleteUrl + '">삭제</a>할 수 있습니다.';
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
               namuapi.raw(higherDocs[i], function (r, t) {
                  higherDocsWE[t] = true;
                  codwe++;
               }, function (t) {
                  higherDocsWE[t] = false;
                  codwnf++;
               });
               if (i == higherDocs.length - 1) {
                  var hdinid = setInterval(function () {
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
                        if (i != 0 && higherDoc.substring(sstl)
                           .indexOf('/') == 0) a.innerHTML = higherDoc.substring(sstl + 1);
                        else a.innerHTML = higherDoc.substring(sstl);
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
         // 문단 접기 이탤릭 표시
         NF_addStyle('.namufix-folded-heading {color: darkgray; opacity: 0.5;}');
         var wikiHeadings = document.querySelectorAll('.wiki-heading')
         for (var i = 0; i < wikiHeadings.length; i++) wikiHeadings[i].addEventListener('click', function (evt) {
            if (evt.target.tagName === 'A') return;
            if (evt.target.nextSibling.style.display === 'none') {
               evt.target.className += ' namufix-folded-heading';
            } else {
               evt.target.className = evt.target.className.replace('namufix-folded-heading', '');
            }
         })
         // 차단 링크 링크화
         if (ENV.docTitle.startsWith('사용자:')) {
            let banbox = document.querySelector('.wiki-content [onmouseover][onmouseout]')
            if (banbox.querySelector('span:first-child')
               .textContent.includes('이 사용자는 차단된 사용자입니다.')) {
               let reason = banbox.lastChild.textContent,
                  urlPattern = /((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/mg,
                  urlMatch = urlPattern.exec(reason),
                  linkIndex = 1,
                  firstLink = null;
               while (urlMatch) {
                  let link = document.createElement("a");
                  link.href = urlMatch[0];
                  link.textContent = `Link #${linkIndex++}`;
                  banbox.appendChild(link);
                  if (!firstLink) firstLink = link;
                  urlMatch = urlPattern.exec(reason);
               }
               if (firstLink) {
                  banbox.insertBefore(document.createElement("br"), firstLink);
                  banbox.insertBefore(document.createElement("br"), firstLink);
               }
            }
         }
      }
      if (ENV.Discussing) {
         // refreshThread, doLoadUnvisibleReses에서 쓰이는 공통로직
         function insertNfFormatTimeScript() {
            var scriptTag = document.createElement("script");
                  scriptTag.innerHTML = 'function nfformattime(){$("time[data-nf-format-this]").each(function(){var format = $(this).attr("data-format");var time = $(this).attr("datetime");$(this).text(formatDate(new Date(time), format));});}';
                  document.body.appendChild(scriptTag);
         }
         insertNfFormatTimeScript();
         // 일부 쓰레드를 다시 불러오는 함수 (일부 함수에서 쓰임)
         function refreshThreads(numbers, callback) { 
            console.log(numbers);
            numbers = numbers.sort();
            if (numbers.length == 0) return callback(null);
            let reqId = numbers[0];
            namuapi.theseedRequest({
               method: "GET",
               url: "https://" + location.host + "/thread/" + ENV.topicNo + "/" + reqId,
               onload: function (res) {
                  console.log('[NamuFix] 특징 레스를 다시 불러오기 위해 레스 응답 받음, 시작 번호는 ' + reqId);
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(res.responseText, "text/html");
                  var timeTags = doc.querySelectorAll('time');
                  var resTags = doc.querySelectorAll('.res-wrapper');
                  for (var i = 0; i < timeTags.length; i++) timeTags[i].dataset.nfFormatThis = "true";
                  for (var i = 0; i < resTags.length; i++) {
                     var resTag = resTags[i];
                     let targetId = parseInt(resTag.dataset.id);
                     if (!numbers.map(i => parseInt(i)).includes(targetId))
                        continue;
                     console.log(targetId);
                     numbers.splice(numbers.indexOf(targetId), 1);
                     var targetTag = document.querySelector('#res-container .res-wrapper[data-id="' + targetId + '"]');
                     if (targetTag == null) continue;
                     targetTag.parentNode.insertBefore(resTag, targetTag.nextSibling);
                     targetTag.parentNode.removeChild(targetTag);
                  }
                  var scriptTagId = 'nf-temp-s' + Date.now() + reqId;
                  var scriptTag = document.createElement('script');
                  scriptTag.id = scriptTagId;
                  scriptTag.innerHTML = 'nfformattime(); var thisTag = document.querySelector("#' + scriptTagId + '"); thisTag.parentNode.removeChild(thisTag);';
                  document.body.appendChild(scriptTag);
                  if (numbers.length == 0) {
                     console.log('[NamuFix] 특정 레스들을 모두 불러옴!');
                     callback(null);
                  } else {
                     return refreshThreads(numbers, callback);
                  }
               }
            });
         }
         // 보여지지 않은 쓰레드도 불러오기
         let unvisibleResesAllLoaded = false;
         if (SET.loadUnvisibleReses) {
            function doLoadUnvisibleReses() {
               var allUnlockedReses = document.querySelectorAll('#res-container div.res-loading[data-locked="false"]');
               for (var i = 0; i < allUnlockedReses.length; i++) {
                  allUnlockedReses[i].setAttribute('data-locked', 'true');
               }
               var reqId = parseInt(allUnlockedReses[0].dataset.id),
                  lastReqId = parseInt(allUnlockedReses[allUnlockedReses.length - 1].dataset.id);
               console.log('[NamuFix] 보이지 않은 레스 불러오기를 시작합니다. 범위 : ' + reqId + ' 에서 ' + lastReqId);
               for (console.log('[NamuFix] loadUnvisibleReses 루프 시작!'); reqId <= lastReqId; reqId += 30) {
                  console.log('[NamuFix] 레스 요청중, 시작 번호는 ' + reqId);
                  namuapi.theseedRequest({
                     method: "GET",
                     url: "https://" + location.host + "/thread/" + ENV.topicNo + "/" + reqId,
                     onload: function (res) {
                        console.log('[NamuFix] 레스 응답 받음, 시작 번호는 ' + reqId);
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(res.responseText, "text/html");
                        var timeTags = doc.querySelectorAll('time');
                        var resTags = doc.querySelectorAll('.res-wrapper');
                        for (var i = 0; i < timeTags.length; i++) timeTags[i].dataset.nfFormatThis = "true";
                        for (var i = 0; i < resTags.length; i++) {
                           var resTag = resTags[i];
                           var targetTag = document.querySelector('#res-container div.res-loading[data-id="' + resTag.dataset.id + '"]');
                           if (targetTag == null) continue;
                           targetTag.parentNode.insertBefore(resTag, targetTag.nextSibling);
                           targetTag.parentNode.removeChild(targetTag);
                        }
                        var scriptTagId = 'nf-temp-s' + Date.now() + reqId;
                        var scriptTag = document.createElement('script');
                        scriptTag.id = scriptTagId;
                        scriptTag.innerHTML = 'nfformattime(); var thisTag = document.querySelector("#' + scriptTagId + '"); thisTag.parentNode.removeChild(thisTag);';
                        document.body.appendChild(scriptTag);
                        setTimeout(() => {
                           if (document.querySelectorAll('#res-container div.res-loading[data-locked="false"]')) {
                              if (!unvisibleResesAllLoaded) {
                                 unvisibleResesAllLoaded = true;
                                 console.log("[NamuFix] 모든 보이지 않은 쓰레를 불러옴!");
                              }
                           }
                        }, 100);
                     }
                  });
               }
            }
            setTimeout(doLoadUnvisibleReses, 600);
         }

         // 블라인드된 쓰레드 부분숨기기
         if (SET.hideHiddenResBody) {
            NF_addStyle('.r-hidden-body {display: none;}');
         }

         // 아이덴티콘 설정들과 변수들
         var isIcon = SET.discussIdenti == 'icon';
         var isThreadicLike = SET.discussIdenti == 'headBg';
         var isIdenticon = SET.discussIdenti == 'identicon';
         var colorDictionary = {},
            identiconDictionary = {};
         // #[0-9]+ 엥커 미리보기
         function mouseoverPreview(message) {
            var anchors = [].slice.call(message.bodyElement.querySelectorAll('.wiki-self-link:not([data-nf-title-processed])'));
            for (var i = 0; i < anchors.length; i++) {
               var anchor = anchors[i];
               if (!/^#[0-9]+$/.test(anchor.getAttribute('href'))) {
                  continue;
               }
               var anchorDirection = document.querySelector('.r-head .num a[id=\'' + /#([0-9]+)$/.exec(anchor.href)[1] + '\']');
               anchor.dataset.target = (anchorDirection) ? anchorDirection.id : "";
               anchor.addEventListener('mouseenter', function (evt) {
                  var anchorDirection = document.getElementById(evt.target.dataset.target);
                  var obj = {};
                  if (anchorDirection == null) {
                     obj = {
                        talker: "?_?",
                        message: "존재하지 않는 메세지입니다.",
                        isFirstAuthor: false,
                        notExists: true
                     }
                  } else if (anchorDirection.parentNode.parentNode.parentNode.parentNode.className.indexOf('res-loading') != -1) {
                     obj = {
                        talker: "?_?",
                        message: "아직 불러오지 않은 메세지입니다.",
                        isFirstAuthor: false,
                        notExists: true
                     }
                  } else {
                     var anchorTarget = anchorDirection.parentNode.parentNode.parentNode;
                     obj = {
                        talker: anchorTarget.querySelector('.r-head > a')
                           .textContent,
                        message: anchorTarget.querySelector('.r-body')
                           .innerHTML,
                        isFirstAuthor: anchorTarget.querySelector('.r-head.first-author') !== null,
                        notExists: false
                     };
                  }
                  var headBackground = obj.notExists ? "red" : obj.isFirstAuthor ? "#a5df9f" : "#b3b3b3";
                  var elem = document.createElement("div");
                  elem.className = 'nfTopicMessage';
                  elem.innerHTML = `<div style="font-size: 17px; font-family: sans-serif; background: ${headBackground}; padding: 7px 10px 7px 15px; font-weight: bold;">${obj.talker}</div><div style="padding: 15px; font-size: 11px; font-weight: normal;">${obj.message}</div>`;
                  elem.style.position = 'absolute';
                  elem.style.color = 'black';
                  elem.style.borderRadius = '4px';
                  elem.style.background = obj.notExists ? 'darkred' : '#d9d9d9';
                  elem.style.zIndex = 3;
                  evt.target.appendChild(elem);
                  evt.target.title = '';
               });
               anchor.addEventListener('mouseleave', function (evt) {
                  //var obj = JSON.parse(evt.target.dataset.targetMessage);
                  if (evt.target.querySelector('.nfTopicMessage')) {
                     var elemToRemove = evt.target.querySelector('.nfTopicMessage');
                     elemToRemove.parentNode.removeChild(elemToRemove);
                  }
               });
               anchor.dataset.nfTitleProcessed = true;
            }
         }

         function previewAsQuote(message) {
            var anchors = [].slice.call(message.bodyElement.querySelectorAll('.wiki-self-link:not([data-nf-title-processed])'));
            for (var i = 0; i < anchors.length; i++) {
               var anchor = anchors[i];
               if (!/^#[0-9]+$/.test(anchor.getAttribute('href'))) {
                  continue;
               }
               var numbericId = /#([0-9]+)$/.exec(anchor.href)[1];
               var anchorDirection = document.querySelector('.r-head .num a[id=\'' + numbericId + '\']');
               if (anchorDirection == null) continue;
               var anchorTarget = deserializeResDom(anchorDirection.parentNode.parentNode.parentNode);
               var talker = anchorTarget.author.name,
                  targetMessage = anchorTarget.bodyElement.innerHTML,
                  talkedAt = anchorTarget.element.querySelector('.r-head > span.pull-right')
                  .textContent;
               var blockquoteId = uniqueID();
               var blockquoteElement = document.createElement("blockquote");
               blockquoteElement.className = "wiki-quote nf-anchor-preview";
               blockquoteElement.innerHTML = targetMessage;
               blockquoteElement.id = blockquoteId;
               blockquoteElement.innerHTML += `<div style="text-align: right; font-style: italic;">--#${numbericId}, ${talker}, ${talkedAt}</div>`;
               message.bodyElement.insertBefore(blockquoteElement, message.bodyElement.firstChild);
               anchor.dataset.quoteId = blockquoteId;
               anchor.addEventListener('mouseenter', function (evt) {
                  var quote = document.getElementById(evt.target.dataset.quoteId);
                  quote.style.borderColor = '#CCC #CCC #CCC red !important';
                  quote.style.boxShadow = '2px 2px 3px orange';
               });
               anchor.addEventListener('mouseleave', function (evt) {
                  var quote = document.getElementById(evt.target.dataset.quoteId);
                  quote.style.borderColor = '';
                  quote.style.boxShadow = '';
               })
            }
         }
         var previewFunction;
         switch (SET.discussAnchorPreviewType) {
         case 1:
            previewFunction = mouseoverPreview;
            break;
         case 2:
            NF_addStyle('' + 'blockquote.nf-anchor-preview{' + 'border-color: #CCC #CCC #CCC #FF9900 !important;' + 'background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABTklEQVRoge2ZvYrCQBSF71ulEVLIFIIgC5LOaQRhwcbCKSLbCYtFunmDBTuLEKwEKx9ASOsjWNlYni2WwK5ZV83PTMa9B053IedjJpCcS8RisZ5baaIxG/YhfA+eZ8i+QH84g05SlAofSd9c6Cv2ZVQMIuy0rIfP3OqEj0GsQ2E99KVFuL4fQjYgcN7yPoDjctyAsL97vDzehtjrwHrQaw70ngEYgAEYgAFsA4gR9OaAEwDghMNGYyRqmqkeoIfF7oxLnXcL9CqfqQVAIc49FgBiqMpn+ASe8h2wawawbQawbQaw7f8B4HwrQeR4L0REFKt2AwL/dFvFj9WL6sZ3iVELVazgnQcNaKeDebmKPU00poOu8f1AdzAtvx+oQ+HLX7V9watiWttIwncZINNrboniGAAR0eot+HYaDgJk+vqddBiAiOhj8u42AItlQZ8Z9UiwBSnJVAAAAABJRU5ErkJggg==") !important;' + 'margin: 0.5em 0px !important;' + '}');
            previewFunction = previewAsQuote;
            break;
         default:
            previewFunction = function () {};
         }
         // 인용형식 앵커 미리보기안의 앵커 미리보기 삭제 옵션 설정시 CSS 추가
         if (SET.removeNFQuotesInAnchorPreview) {
            NF_addStyle("blockquote.nf-anchor-preview blockquote.nf-anchor-preview {display: none;}");
         }
         // 아이덴티콘
         function identiconLoop(message) {
            if (/^\/discuss\/(.+?)/.test(location.pathname)) return;
            var colorHash = isThreadicLike ? new ColorHash({
               lightness: Number(SET.discussIdentiLightness),
               saturation: Number(SET.discussIdentiSaturation)
            }) : new ColorHash();
            if (isIdenticon && document.querySelector('#nf-identicon-css') == null) {
               var cssContent = 'div.nf-identicon { border: 1px solid #808080; margin: 10px; width: 64px; border: 1px black solid; background: white;} .res.hasNFIdenticon {margin-left: 88px; position: relative; top: -76px;}';
               var styleTag = document.createElement("style");
               styleTag.innerHTML = cssContent;
               styleTag.id = "nf-identicon-css";
               document.head.appendChild(styleTag);
            }
            if (isIcon && message.author.isFirst) return;
            let n = message.author.name;
            if (!message.author.isIP) {
               // 로그인
               n = '!ID!' + n;
            } else {
               // IP
               n = '!IP!' + n;
            }
            n = SHA1(n);
            var nColor;
            if (typeof colorDictionary[n] === 'undefined') {
               nColor = colorHash.hex(n);
               colorDictionary[n] = nColor;
            } else {
               nColor = colorDictionary[n];
            }
            if (isThreadicLike) {
               message.element.querySelector('.r-head')
                  .style.background = nColor;
               message.element.querySelector('.r-head')
                  .style.color = 'white';
               message.element.querySelector('.r-head > a')
                  .style.color = 'white';
               message.element.querySelector('.r-head .num a')
                  .style.color = 'white';
            } else if (isIcon) {
               var a = message.element.querySelector('.r-head > a');
               var span = document.createElement("span");
               span.style.background = nColor;
               span.style.color = nColor;
               span.style.marginLeft = '1em';
               span.innerHTML = '__';
               a.parentNode.insertBefore(span, a.nextSibling);
            } else if (isIdenticon) {
               message.element.className += " hasNFIdenticon";
               let identicon = document.createElement("div");
               identicon.className = "nf-identicon";
               identicon.style.position = 'relative';
               identicon.innerHTML = '<div class="identicon-pointer" style="width: 0px;height: 0px;position: absolute;border-top: 20px solid transparent;border-right: 15px solid #B0D3AD;left: 64px;border-bottom: 20px solid transparent;"></div><a><img style="width: 64px; height: 64px;"></img></a>';
               identicon.querySelector("img")
                  .dataset.hash = n;
               identicon.querySelector("a")
                  .dataset.hash = n;
               identicon.querySelector("a")
                  .href = "#NothingToLink";
               identicon.querySelector("a")
                  .addEventListener('click', async function (evt) {
                     evt.preventDefault();
                     await SET.load();
                     var h = evt.target.dataset.hash;
                     if (typeof SET.customIdenticons[h] !== 'undefined') {
                        // custom identicon exists
                        if (confirm('이미 이미지가 설정되어 있습니다. 제거할까요?')) {
                           delete SET.customIdenticons[h];
                           await SET.save();
                           alert('설정됐습니다. 새로고침시 적용됩니다');
                        }
                     } else {
                        if (!confirm('이 아이디 또는 닉네임에 기존 아이덴티콘 대신 다른 이미지를 설정할 수 있습니다.\n설정할까요?')) return;
                        // doesn't exists
                        getFile(function (files, finish) {
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
                              reader.onload = async function (evt) {
                                 SET.customIdenticons[h] = reader.result;
                                 await SET.save();
                                 alert('설정됐습니다. 새로고침시 적용됩니다');
                                 finish();
                              };
                              reader.readAsDataURL(file);
                           }
                        });
                     }
                  });
               if (typeof identiconDictionary[n] === 'undefined' && typeof SET.customIdenticons[n] !== 'undefined') identiconDictionary[n] = SET.customIdenticons[n];
               if (typeof identiconDictionary[n] === 'undefined') {
                  switch (SET.identiconLibrary) {
                  case 'gravatar':
                     identiconDictionary[n] = "https://secure.gravatar.com/avatar/" + n.substring(0, 32) + "?s=64&d=identicon"
                     break;
                  case 'robohash':
                     identiconDictionary[n] = "https://robohash.org/" + n.substring(0, 16) + ".png?size=64x64&set=" + SET.robohashSet + "&bgset=bg1"
                     break;
                  case 'identicon':
                     identiconDictionary[n] = "data:image/svg+xml;base64," + new Identicon(n, {
                           size: 64,
                           format: 'svg'
                        })
                        .toString();
                     break;
                  default:
                  case 'jdenticon':
                     identiconDictionary[n] = "data:image/svg+xml;base64," + btoa(jdenticon.toSvg(n, 64));
                     break;
                  }
               }
               let identiconImage = identiconDictionary[n];
               identicon.querySelector('img')
                  .src = identiconImage;
               message.element.parentNode.insertBefore(identicon, message.element);
               message.element.querySelector('.r-head')
                  .style.borderLeft = 'none';
               identicon.querySelector('.identicon-pointer')
                  .style.borderRight = '15px solid ' + getComputedStyle(message.element.querySelector('.r-head'))
                  .backgroundColor;
               if (message.element.parentNode.dataset.id != 1) {
                  message.element.parentNode.style.marginTop = '-76px';
                  identicon.style.marginTop = '-66px';
               }
            }
         }

         function checkIP(message) {
            if (!message.author.isIP) return;
            var span = document.createElement("span");
            span.style.color = "red";
            message.nfHeadspan.appendChild(span);
            span.innerHTML = "[(IP 확인중: IP정보 조회중)]";
            // get ip info
            getIpInfo(message.author.name, SET.ipInfoDefaultOrg, async function (resObj) {
               if (resObj !== null) {
                  let country = resObj.country;
                  let countryName = korCountryNames[country.toUpperCase()] || country;
                  let isp = resObj.org;
                  let flagIconData = await getFlagIcon(country.toLowerCase());
                  let whoisResult = SET.checkWhoisNetTypeOnDiscuss ? await (new Promise((resolve, reject) => {
                     getIpWhois(message.author.name, whoisRes => resolve(whoisRes));
                  })) : null;
                  let whoisNetType = false;
                  if (whoisResult && whoisResult.success && !whoisResult.raw) {
                     whoisNetType = (whoisResult.result.items.filter(v => v.name === 'netType') || {value:null}).value;
                  }
                  span.innerHTML = `[<img src="${flagIconData}" style="height: 0.9rem;" title="${countryName}"></img> ${isp}${await checkVPNGateIP(message.author.name) ? " (VPNGATE)" : ""}]${whoisNetType ? "<span style=\"color: darkred;\">[" + whoisNetType + "]</span>" : ""}<a href="#" class="get-whois">[WHOIS]</a>`;
                  span.querySelector('a.get-whois')
                     .addEventListener('click', function (evt) {
                        evt.preventDefault();
                        whoisPopup(message.author.name);
                     });
               } else {
                  span.innerHTML = "[IP조회실패]<a href=\"#\" class=\"get-whois\">[WHOIS]</a>"
                  span.querySelector('a.get-whois')
                     .addEventListener('click', function (evt) {
                        evt.preventDefault();
                        whoisPopup(message.author.name);
                     });
               }
            });
         }

         function quickBlockLoop(i) {
            let blockAnchor = document.createElement("a");
            blockAnchor.href = "#";
            blockAnchor.textContent = "[차단]";
            blockAnchor.addEventListener('click', (evt) => {
               evt.preventDefault();
               quickBlockPopup({
                  author: i.author,
                  defaultDuration: SET.quickBlockDefaultDuration,
                  defaultReason: SET.quickBlockReasonTemplate_discuss.replace(/\$\{host\}/g, location.host)
                     .replace(/\$\{threadNo\}/g, ENV.topicNo)
                     .replace(/\$\{messageNo\}/g, i.no)
               });
            });
            i.nfHeadspan.appendChild(blockAnchor);
         }
         let emphasizeResStyle = document.createElement("style");
         let emphasizedHash = null;
         document.head.appendChild(emphasizeResStyle);

         function emphasizeWhenMouseoverLoop(i) {
            let usernameHash = SHA1((i.author.isIP ? '!IP!' : '!ID!') + i.author.name);
            i.element.dataset.usernameHash = usernameHash;
            let linkAnchor = document.createElement("a");
            linkAnchor.href = "#";
            linkAnchor.className = "nf-emp-thread-link"
            linkAnchor.innerHTML = '[강조]' // ionicon에 압정 아이콘이 안 보인다. 이런데 쓰면 딱인데...
            linkAnchor.title = "이 사용자의 쓰레드를 강조합니다."
            linkAnchor.addEventListener("click", (evt) => {
               evt.preventDefault();
               if (emphasizedHash !== usernameHash) {
                  emphasizedHash = usernameHash;
                  emphasizeResStyle.innerHTML = `.res[data-username-hash="${usernameHash}"] .r-head {background: #8a8a8a !important} .res[data-username-hash="${usernameHash}"] .r-head.first-author {background: #8DAD8A !important} .res[data-username-hash="${usernameHash}"] .nf-emp-thread-link {color: red;} .res:not([data-username-hash="${usernameHash}"]) {filter: blur(1.5px);}`
               } else {
                  emphasizedHash = null;
                  emphasizeResStyle.innerHTML = "";
               }
               console.log(emphasizedHash);
            });
            i.nfRightHeadSpan.appendChild(linkAnchor);
            i.element.addEventListener('mouseover', () => {
               if (emphasizedHash === null) emphasizeResStyle.innerHTML = `.res[data-username-hash="${usernameHash}"] .r-head {background: #8a8a8a !important} .res[data-username-hash="${usernameHash}"] .r-head.first-author {background: #8DAD8A !important}`
            })
            i.element.addEventListener('mouseout', () => {
               if (emphasizedHash === null) emphasizeResStyle.innerHTML = ''
            });
         }

         function batchDiscussBlind(message) {
            function btnHandler(act) {
               return function (e) {
                  e.preventDefault();
                  let checks = [...document.querySelectorAll('input.nf-batch-blind-checkbox')];
                  let numbers = checks.filter(i => i.checked).map(i => parseInt(i.value));
                  let urls = numbers.map(i => `/admin/thread/${ENV.topicNo}/${i}/${act}`);
                  // popup
                  let win = TooSimplePopup();
                  win.title('일괄 블라인드중');
                  let progress;
                  win.content(container => {
                     container.innerHTML = `${urls.length}개의 쓰레드를 블라인드${act == 'show' ? ' 해제' : ''}하고 있습니다.<br><progress></progress>`;
                     progress = container.querySelector('progress');
                  });
                  progress.max = urls.length;
                  progress.value = 0;
                  async.eachLimit(urls, SET.adminReqLimit, (i, cb) => {
                     namuapi.theseedRequest({
                        url: i,
                        method: "GET",
                        onload: function () {
                           progress.value++;
                           cb(null);
                        }
                     });
                  }, err => {
                     progress.value = progress.max;
                     win.content(container => container.innerHTML = '완료. 일부 스레드를 다시 불러오는 중....');
                     setTimeout(() => {
                        refreshThreads(numbers, () => {
                           win.close();
                        });
                     }, 50);
                  });
               };
            }
            // Checkbox
            let checkBox = document.createElement('input');
            checkBox.name = 'nf-batch-blind-checkinput';
            checkBox.className = 'nf-batch-blind-checkbox';
            checkBox.type = 'checkbox';
            checkBox.value = message.no;
            message.nfLeftHeadspan.appendChild(checkBox);
            // Blind Button
            let batchBlindBtn = document.createElement('a');
            batchBlindBtn.className = 'btn btn-danger btn-sm';
            batchBlindBtn.href = '#';
            batchBlindBtn.addEventListener('click', btnHandler('hide'));
            batchBlindBtn.textContent = '[NAMUFIX] 일괄 블라인드';
            // Unblind Button
            let batchUnblindBtn = document.createElement('a');
            batchUnblindBtn.className = 'btn btn-danger btn-sm';
            batchUnblindBtn.href = '#';
            batchUnblindBtn.addEventListener('click', btnHandler('show'));
            batchUnblindBtn.textContent = '[NAMUFIX] 일괄 블라인드 해제'
            // Button Group
            let btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            btnGroup.appendChild(batchBlindBtn);
            btnGroup.appendChild(batchUnblindBtn);
            message.nfCombo.appendChild(btnGroup);
         }

         function makeBlindSlient(message) {
            let blindBtn = message.element.querySelector('.combo.admin-menu > a.btn.btn-danger');
            if(!blindBtn)
               return;
            blindBtn.addEventListener('click', e => {
               e.preventDefault();
               namuapi.theseedRequest({
                  url: e.target.href,
                  method: "GET",
                  onload: function () {
                     setTimeout(() => refreshThreads([message.no], () => {}), 50);
                  }
               });
            })
         }

         function deserializeResDom(resElement) {
            let userLink = resElement.querySelector('.r-head > a'),
               anchor = resElement.querySelector('.r-head .num > a');
            return {
               element: resElement,
               no: anchor.id,
               author: {
                  name: resElement.querySelector('.r-head > a')
                     .textContent.trim(),
                  isFirst: resElement.querySelector('.r-head')
                     .className.includes('first-author'),
                  isIP: resElement.querySelector('.r-head > a')
                     .href.includes('/contribution/ip')
               },
               bodyElement: resElement.querySelector('.r-body'),
               get nfHeadspan() {
                  let headspan = resElement.querySelector('.nf-headinfo')
                  if (!headspan) {
                     headspan = document.createElement("span");
                     headspan.className = "nf-headinfo";
                     userLink.parentNode.insertBefore(headspan, userLink.nextSibling);
                     headspan.style.marginLeft = "1em";
                  }
                  delete this.nfHeadspan;
                  return this.nfHeadspan = headspan;
               },
               get nfLeftHeadspan() {
                  let headspan = resElement.querySelector('.nf-headinfo-left')
                  if (!headspan) {
                     headspan = document.createElement("span");
                     headspan.className = "nf-headinfo-left";
                     //userLink.parentNode.insertBefore(headspan, userLink);
                     resElement.querySelector('.num').parentNode.insertBefore(headspan, resElement.querySelector('.num'));
                     headspan.style.marginRight = "0.3rem";
                  }
                  delete this.nfLeftHeadspan;
                  return this.nfLeftHeadspan = headspan;
               },
               get nfRightHeadSpan() {
                  let rightHeadSpan = resElement.querySelector('.nf-headinfo-right')
                  if (!rightHeadSpan) {
                     rightHeadSpan = document.createElement("span");
                     rightHeadSpan.className = "nf-headinfo-right"
                     let time = resElement.querySelector('.r-head > .pull-right > time');
                     time.parentNode.insertBefore(rightHeadSpan, time.nextSibling);
                     rightHeadSpan.style.marginLeft = "0.25rem";
                  }
                  delete this.nfRightHeadSpan;
                  return this.nfRightHeadSpan = rightHeadSpan;
               },
               get nfCombo() {
                  let adminCombo = resElement.querySelector('.combo.admin-menu');
                  if(!adminCombo) {
                     let newCombo = document.createElement("div");
                     newCombo.setAttribute("class", "combo admin-menu");
                     resElement.querySelector('.res').appendChild(newCombo);
                     adminCombo = newCombo;
                  }
                  let nfComboArea = adminCombo.querySelector('.nf-combo-area');
                  if (!nfComboArea) {
                     nfComboArea = document.createElement('span');
                     nfComboArea.className = 'nf-combo-area';
                     adminCombo.appendChild(nfComboArea);
                  }
                  delete this.nfCombo;
                  return this.nfCombo = nfComboArea;
               }
            }
         }

         function discussLoop() {
            let handles = {
               "preview": previewFunction,
               "identicon": identiconLoop
            };
            if (SET.addQuickBlockLink) handles.quickBlock = quickBlockLoop
            if (SET.lookupIPonDiscuss) handles.checkIp = checkIP;
            if (SET.emphasizeResesWhenMouseover) handles.emphasizeReses = emphasizeWhenMouseoverLoop;
            if (SET.addBatchBlindButton) handles.batchblind = batchDiscussBlind;
            if (SET.slientBlind) handles.slientblind = makeBlindSlient;
            let messages = document.querySelectorAll('.res-wrapper:not(.res-loading) > .res:not([nf-looped])');
            let tmpcnt = 0; //fordebug
            for (let i of messages)
               for (let j in handles) {
                  let resObj = deserializeResDom(i);
                  if (i.dataset["nfLoop_" + j] !== "yes") {
                     i.dataset["nfLoop_" + j] = "yes";
                     setTimeout(() => {
                        handles[j](resObj);
                     }, 0);
                  }
               }
            if (SET.notifyForUnvisibleThreads) {
               Notification.requestPermission()
                  .then(() => {
                     if (document.visibilityState === 'hidden') {
                        if (SET.loadUnvisibleReses && !unvisibleResesAllLoaded) return;
                        let n = new Notification(`토론 알림 : #${ENV.topicNo} - ${ENV.topicTitle}`, {
                           body: '토론을 확인해주세요. 알람을 원하지 않으시면 NamuFix 설정에서 비활성화할 수 있습니다.',
                           icon: `/favicon.ico`
                        })
                     }
                  });
            }
         }
         discussLoop();
         var observer = new MutationObserver(discussLoop);
         observer.observe(document.querySelector("#res-container"), {
            childList: true
         });
      } else if (ENV.IsUserContribsPage) {
         function insertBeforeTable(element) {
            var bread = document.querySelector(".wiki-article ol.breadcrumb.link-nav");
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
                  tr.innerHTML += `<th>${dayNames[i]}</th>`;
                  for (var ii = 0; ii < 24; ii++) {
                     var td = document.createElement("td");
                     td.innerHTML = '&nbsp;'
                     td.style.background = `rgba(61,0,61,${maps[i][ii] / maxValue})`;
                     if (i == 0) {
                        function twoDigits(a) {
                           var p = String(a);
                           return p.length == 1 ? '0' + p : p;
                        }
                        headTr.innerHTML += `<th>${twoDigits(ii)}:00 ~ ${twoDigits(ii + 1)}:00</th>`;
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
         var p = document.createElement("p");
         p.innerHTML += '<style>.contInfo { border-collapse: collapse; border: 1px solid black; padding: 2px;} #contInfo td {padding: 3px;} #contInfo td:nth-child(2) {border-left: 1px solid black;}</style>';
         var ipPattern = /\/ip\/([a-zA-Z0-9:\.]+)\/(?:document|discuss)/;
         if (ipPattern.test(location.href)) {
            // ip
            // check ip
            var ip = ipPattern.exec(location.href)[1];
            var ipInfo = document.createElement("p");
            ipInfo.innerHTML = '<div style="border: 1px black solid; padding: 2px;">IP 관련 정보를 조회중입니다. 잠시만 기다려주세요.</div>'
            insertBeforeTable(ipInfo);
            getIpInfo(ip, SET.ipInfoDefaultOrg, function (resObj) {
               var country = resObj.country;
               var countryName = korCountryNames[country.toUpperCase()] || country.toUpperCase();
               var isp = resObj.org;
               getFlagIcon(country.toLowerCase()).then(async function (countryIcon) {
                  ipInfo.innerHTML = `<table class="contInfo">
              <tbody>
              <tr><td>국가</td><td><img src=\"${countryIcon}\" style=\"height: 0.9rem;\"></img> ${countryName}</td></tr>
              <tr><td>통신사</td><td>${isp}</td></tr>
              <tr><td>VPNGATE?</td><td>${await checkVPNGateIP(ip) ? "<span style=\"color: red;\">YES! This is currently WORKING VPNGATE IP!</span>" : "Not a vpngate ip"}</td></tr>
              <tr><td>KISA WHOIS</td><td><a href="#" class="get-whois">조회하기</a></td></tr>
              <tr class="nf_ipblockchecking"><td colspan="2">IP 차단기록을 검색하고 있습니다... 잠시만 기다려주세요.</td></tr>
              <tr class="nf-quickblock-row"><td>빠른차단</td><td><a class="nf-quickblock">빠른차단</a></td></tr>
              </tbody>
              <tfoot>
              <tr><td colspan="2" style="border-top: 1px solid black;">기술적인 한계로, VPNGATE 여부는 "현재 VPNGATE VPN인가?"의 여부이지, "작성 당시에 VPNGATE VPN인가?"의 여부가 아닙니다.<br>
              또한 외국 IP의 차단기록의 경우 /32 마스크만 검색하며, 사측의 비공개 차단은 검색이 불가능합니다.</td></tr>
              </foot>
              </table>`;
                  ipInfo.querySelector('a.get-whois')
                     .addEventListener('click', function (evt) {
                        evt.preventDefault();
                        whoisPopup(ip);
                     })
                  ipInfo.querySelector('a.nf-quickblock')
                     .addEventListener('click', (evt) => {
                        evt.preventDefault();
                        quickBlockPopup({
                           author: {
                              name: ip,
                              isIP: true
                           },
                           defaultDuration: SET.quickBlockDefaultDuration,
                           defaultReason: "긴급조치"
                        })
                     });
                  if (!SET.addQuickBlockLink) ipInfo.querySelector('.nf-quickblock-row')
                     .style.display = 'none';

                  function prepareIsBlockedDisplay(mask, tbody) {
                     let row = document.createElement("tr");
                     row.innerHTML = "<td>IP차단기록 (" + mask + ")</td><td class=\"nf_isipblocked mask-" + /([0-9]+)/.exec(mask)[1] + "\">조회중입니다...</td>";
                     tbody.appendChild(row);
                  }

                  function displayIsBlocked(mask, tbody) {
                     let displayHolder = tbody.querySelector(".nf_isipblocked.mask-" + /([0-9]+)/.exec(mask)[1]);
                     namuapi.searchBlockHistory({
                        query: ip + mask,
                        isAuthor: false
                     }, function (result) {
                        var filtered = result.filter(function (v) {
                           return v.blocked === ip + mask;
                        });
                        if (filtered.length == 0) {
                           return displayHolder.innerHTML = "차단기록 없음.";
                        }
                        var actType = filtered[0].type;
                        if (actType == "blockIP") {
                           displayHolder.innerHTML = filtered[0].blocker + '에 의해 ' + (filtered[0].duration || '') + ' <span style="color:red">차단됨.</span> (일시 : ' + formatDateTime(filtered[0].at) + ', 이유 : ' + filtered[0].reason + ')';
                        } else if (actType == "unblockIP") {
                           displayHolder.innerHTML = filtered[0].blocker + '에 의해 ' + (filtered[0].duration || '') + ' <span style="color:green">차단이 해제됨.</span> (일시 : ' + formatDateTime(filtered[0].at) + ', 이유 : ' + filtered[0].reason + ')';
                        } else {
                           displayHolder.innerHTML = "??? 기록 검색중 오류가 발생함.";
                        }
                     });
                  }
                  getIpWhois(ip, (whoisRes) => {
                     ipInfo.querySelector('.nf_ipblockchecking')
                        .parentNode.removeChild(ipInfo.querySelector('.nf_ipblockchecking'));
                     if (!whoisRes.success || whoisRes.raw) {
                        prepareIsBlockedDisplay('/32', ipInfo.querySelector('tbody'));
                        displayIsBlocked('/32', ipInfo.querySelector('tbody'));
                     } else {
                        let prefixes = [];
                        for(let i of whoisRes.result.items.filter(v => v.name === 'prefix').map(v => v.value.split('+')))
                           prefixes = prefixes.concat(i);
                        prefixes = new Set(prefixes); // https://stackoverflow.com/a/14438954
                        if (!prefixes.has('/32')) prefixes.add('/32');
                        let delay = 0;
                        for (let prefix of prefixes) {
                           prepareIsBlockedDisplay(prefix, ipInfo.querySelector('tbody'));
                           setTimeout(() => {
                              displayIsBlocked(prefix, ipInfo.querySelector('tbody'));
                           }, (delay++) * SET.ipBlockHistoryCheckDelay + 1);
                        }
                     }
                  });
               });
            });
         } else {
            // parse username
            var userIdPattern = /^\/contribution\/author\/(.+?)\/(?:document|discuss)/;
            var userId = userIdPattern.exec(location.pathname)[1];
            // block user link
            if (SET.addQuickBlockLink) {
               let quickBlockLink = document.createElement("div");
               quickBlockLink.innerHTML = '<div style="border: 1px black solid; padding: 2px;">빠른차단 : <a href="#">[차단]</a></div>'
               quickBlockLink.querySelector('a')
                  .addEventListener('click', (evt) => {
                     evt.preventDefault();
                     quickBlockPopup({
                        author: {
                           name: userId,
                           isIP: false
                        },
                        defaultDuration: SET.quickBlockDefaultDuration,
                        defaultReason: "긴급조치"
                     })
                  })
               insertBeforeTable(quickBlockLink);
            }
            // user blockhistory
            var userInfo = document.createElement("p");
            userInfo.innerHTML = '<div style="border: 1px black solid; padding: 2px;" class="nf_blockhistory">차단 기록 조회중...</div>'
            insertBeforeTable(userInfo);
            namuapi.searchBlockHistory({
               query: '"' + userId + '"',
               isAuthor: false
            }, function (result) {
               var filtered = result.filter(function (v) {
                  return v.blocked == userId
               });
               if (filtered.length == 0) {
                  return userInfo.querySelector('.nf_blockhistory')
                     .innerHTML = "차단기록 없음.";
               }
               userInfo.querySelector('.nf_blockhistory')
                  .innerHTML = '<style>.nf_blockhistory p {margin: 1px; padding: 0px;}</style>';
               for (var i = 0; i < filtered.length; i++) {
                  var filteredItem = filtered[i];
                  var actType = filteredItem.type;
                  if (actType == "blockUser") {
                     userInfo.querySelector(i == 0 ? '.nf_blockhistory' : '.nf_blockhistory_rest')
                        .innerHTML += '<p>' + filteredItem.blocker + '에 의해 ' + (filteredItem.duration || '') + ' <span style="color:red">차단됨.</span> (일시 : ' + formatDateTime(filteredItem.at) + ', 이유 : ' + filteredItem.reason + ')' + '</p>';
                  } else if (actType == "unblockUser") {
                     userInfo.querySelector(i == 0 ? '.nf_blockhistory' : '.nf_blockhistory_rest')
                        .innerHTML += '<p>' + filteredItem.blocker + '에 의해 ' + (filteredItem.duration || '') + ' <span style="color:green">차단이 해제됨.</span> (일시 : ' + formatDateTime(filteredItem.at) + ', 이유 : ' + filteredItem.reason + ')' + '</p>';
                  }
                  if (i == 0) {
                     userInfo.querySelector('.nf_blockhistory')
                        .innerHTML += '<a href="#" id="nf_more_blockhistory">[차단기록 더 보기]</a><div class="nf_blockhistory_rest" style="display: none;"></div>'
                     userInfo.querySelector('#nf_more_blockhistory')
                        .addEventListener('click', (evt) => {
                           evt.preventDefault();
                           document.querySelector('.nf_blockhistory_rest')
                              .style.display = '';
                           evt.target.style.display = 'none';
                        })
                  } else if (i == filtered.length - 1) {
                     userInfo.querySelector('.nf_blockhistory_rest')
                        .innerHTML += '<a href="#" id="nf_less_blockhistory">[숨기기]</a>';
                     userInfo.querySelector('#nf_less_blockhistory')
                        .addEventListener('click', (evt) => {
                           evt.preventDefault();
                           document.querySelector('.nf_blockhistory_rest')
                              .style.display = 'none';
                           userInfo.querySelector('#nf_more_blockhistory')
                              .style.display = '';
                        })
                  }
               }
            });
         }
         if (/\/document(?:#.+|)$/.test(location.href)) {
            var rows = document.querySelectorAll('table tbody tr');
            var contCount = 0,
               contTotalBytes = 0,
               contDocuments = 0,
               deletedDocuments = [],
               createdDocuments = [],
               documentNameBefore = "",
               contributedAt = [];
            var documents = [];
            for (var i = 0; i < rows.length; i++) {
               var row = rows[i];
               if (row.querySelector('a')) {
                  let documentLink = row.querySelector('a')
                     .getAttribute('href'),
                     documentRev = 1;
                  if (row.querySelector('a[href^="/diff/"]')) {
                     let diffLink = row.querySelector('a[href^="/diff/"]')
                        .getAttribute('href');
                     documentRev = parseInt(/\??rev=([0-9]+)/.exec(diffLink)[1]);
                  }
                  var documentName = decodeURIComponent(/\/w\/(.+)/.exec(documentLink)[1]);
                  documentNameBefore = documentName;
                  var contributedBytes = row.querySelector('span.f_r > span')
                     .innerHTML;
                  var negativeContribution = /^\-[0-9]+/.test(contributedBytes);
                  if (/^\+[0-9]+/.test(contributedBytes)) contributedBytes = contributedBytes.substring(contributedBytes.indexOf('+'));
                  contributedBytes = Number(contributedBytes);
                  row.dataset.docnameAndRev = JSON.stringify({documentName, documentRev});
                  // 긴급차단 링크
                  if (SET.addQuickBlockLink) {
                     let userIdPattern = /^\/contribution\/(?:author|ip)\/(.+?)\/(?:document|discuss)/;
                     let userId = userIdPattern.exec(location.pathname)[1];
                     let quickBlockLink = document.createElement("a");
                     quickBlockLink.href = "#";
                     quickBlockLink.innerHTML = " [차단]";
                     console.log(SET.quickBlockReasonTemplate_history);
                     quickBlockLink.addEventListener("click", (evt) => {
                        evt.preventDefault();
                        let parent = evt.target;
                        while(!parent.dataset.docnameAndRev)
                           parent = parent.parentNode;
                        let {documentRev, documentName} = JSON.parse(parent.dataset.docnameAndRev);
                        quickBlockPopup({
                           author: {
                              name: userId,
                              isIP: validateIP(userId)
                           },
                           defaultDuration: SET.quickBlockDefaultDuration,
                           defaultReason: SET.quickBlockReasonTemplate_history.replace(/\$\{host\}/g, location.host)
                              .replace(/\$\{revisionNo\}/g, "r" + documentRev)
                              .replace(/\$\{docName\}/g, documentName)
                        });
                     })
                     row.querySelector('td')
                        .insertBefore(quickBlockLink, row.querySelector('a[href^="/discuss/"]')
                           .nextSibling)
                  }
                  // 통계
                  if (documents.indexOf(documentName) == -1) documents.push(documentName);
                  contCount++;
                  if (negativeContribution) contTotalBytes -= contributedBytes;
                  else contTotalBytes += contributedBytes;
                  if (row.querySelector('time')) {
                     contributedAt.push(new Date(row.querySelector('time')
                        .getAttribute("datetime")));
                  }
               } else if (row.querySelector('i')) {
                  var italicText = row.querySelector('i')
                     .innerHTML;
                  if (italicText == '(새 문서)' && createdDocuments.indexOf(documentNameBefore) == -1) createdDocuments.push(documentNameBefore);
                  else if (italicText == '(삭제)' && deletedDocuments.indexOf(documentNameBefore) == -1) deletedDocuments.push(documentNameBefore);
               }
            }
            p.innerHTML += `<table class="contInfo">
        <tfoot>
        <tr><td colspan="2" style="border-top: 1px solid black;">최근 30일간의 데이터만 반영되었으므로, 최근 30일 간의 기여 정보입니다.</td></tr>
        </foot>
        <tbody>
        <tr><td>총 기여 횟수</td><td>${contCount}회</td></tr>
        <tr><td>기여한 바이트 총합</td><td>${contTotalBytes}자</td></tr>
        <tr><td>총 기여한 문서 (ACL 변경, 문서 이동 포함) 수</td><td>${documents.length}개</td></tr>
        <tr><td>삭제한 문서 수</td><td>${deletedDocuments.length}개</td></tr>
        <tr><td>새로 만든 문서 수</td><td>${createdDocuments.length}개</td></tr>
        <tr><td>한 문서당 평균 기여 바이트</td><td>${(contTotalBytes / documents.length)}자</td></tr>
        <tr><td>시간대별 기여/활동 횟수 분포(문서 기여)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>
        </tbody>
        </table>`;
            p.querySelector('a#punch')
               .addEventListener('click', function (evt) {
                  evt.preventDefault();
                  var win = TooSimplePopup();
                  win.title('시간대별 기여/활동 횟수 분포(문서 기여)');
                  win.content(function (element) {
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
            var rows = document.querySelectorAll('table tbody tr');
            var docuAndTalks = {};
            var talkedAt = [];
            for (var i = 0; i < rows.length; i++) {
               var row = rows[i];
               if (row.querySelectorAll('a')
                  .length == 0) continue;
               var docuNow = rows[i].querySelector('a')
                  .getAttribute('href')
                  .replace(/#[0-9]+$/, '');
               docuNow = /^\/thread\/(.+)(?:#[0-9]+|)/.exec(docuNow)[1];
               if (docuAndTalks[docuNow]) {
                  docuAndTalks[docuNow]++;
               } else {
                  docuAndTalks[docuNow] = 1;
               }
               if (row.querySelector('time')) {
                  talkedAt.push(new Date(row.querySelector('time')
                     .getAttribute("datetime")));
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
            discussCount = Object.keys(docuAndTalks)
               .length;
            avgTalks = totalTalks / discussCount;
            p.innerHTML += `<table class="contInfo">
        <tfoot>
        <tr><td colspan="2" style="border-top: 1px solid black;">최근 30일 간의 토론 정보만 반영되었으므로, 최근 30일 간의 토론 정보입니다.</td></tr>
        </tfoot>
        <tbody>
        <tr><td>총 발언 수</td><td>${totalTalks}</td></tr>
        <tr><td>참여한 토론 수</td><td>${discussCount}</td></tr>
        <tr><td>한 토론 당 평균 발언 수</td><td>${avgTalks}</td></tr>
        <tr><td>한 토론 당 발언 수 표준편차</td><td>${standardDeviation(Talks)}</td></tr>
        <tr><td>시간대별 기여/활동 횟수 분포(토론)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>
        </tbody>
        </table>`;
            p.querySelector('a#punch')
               .addEventListener('click', function (evt) {
                  evt.preventDefault();
                  var win = TooSimplePopup();
                  win.title('시간대별 기여/활동 횟수 분포(토론)');
                  win.content(function (container) {
                     container.appendChild(makeHeatTable(talkedAt));
                  });
                  win.button('닫기', win.close);
               })
         } else {
            delete p;
         }
         if (typeof p !== 'undefined') insertBeforeTable(p);
      } else if (ENV.IsDiff) {
         setTimeout(function () {
            var diffLinksHtml = `<nav>
        <ul class="pagination">
        <li class="page-item"><a href="/diff/${ENV.docTitle}?oldrev=${ENV.beforeRev - 1}&rev=${ENV.beforeRev}">&lt;-- r${ENV.beforeRev - 1} vs r${ENV.beforeRev}</a></li>
        <li class="page-item"><a href="/w/${ENV.docTitle}?rev=${ENV.beforeRev}">r${ENV.beforeRev} 보기</a></li>
        <li class="page-item"><a href="/history/${ENV.docTitle}?from=${ENV.afterRev}">역사로</a></li>
        <li class="page-item"><a href="/w/${ENV.docTitle}?rev=${ENV.afterRev}">r${ENV.afterRev} 보기</a></li>
        <li class="page-item"><a href="/diff/${ENV.docTitle}?oldrev=${ENV.afterRev}&rev=${ENV.afterRev + 1}">r${ENV.afterRev} vs r${ENV.afterRev + 1} --&gt;</a></li>
        </ul>
        </nav>`;
            if (ENV.skinName == "liberty") {
               var divTag = document.createElement("div");
               var articleTag = document.querySelector('.wiki-article');
               if (articleTag.querySelector('.diff') == null) return;
               divTag.innerHTML = diffLinksHtml;
               articleTag.insertBefore(divTag, articleTag.firstChild.nextSibling);
            }
            var divTag = document.createElement("div");
            var articleTag = document.querySelector('article');
            if (articleTag == null) return;
            divTag.innerHTML = diffLinksHtml;
            articleTag.insertBefore(divTag, articleTag.querySelector('article h1')
               .nextSibling);
         }, 500);
      } else if (ENV.IsSearch) {
         if (ENV.SearchQuery.indexOf('기여:') == 0) {
            var target = ENV.SearchQuery.substring(3)
               .trim();
            if (validateIP(target)) {
               location.pathname = '/contribution/ip/' + target + '/document';
            } else {
               location.pathname = '/contribution/author/' + target + '/document';
            }
         }
      } else if (ENV.IsIPACL || ENV.IsSuspendAccount || ENV.IsBoardIPACL || ENV.IsBoardSuspendAccount) {
         var expireSelect = document.querySelector('select[name=expire]');

         function enterEasily() {
            enterTimespanPopup('차단기간 쉽게 입력하기', function (result) {
               if (result !== null) document.querySelector('input[name="expire"]')
                  .value = result;
            });
         }

         function replaceExpireSelect() {
            var newExpireInput = document.createElement('input');
            newExpireInput.setAttribute("type", "number");
            newExpireInput.setAttribute("class", "form-control");
            newExpireInput.setAttribute("name", "expire");
            var explain = document.createElement("p");
            explain.innerText = "차단기간은 초 단위로 입력해야 하며, 무기한 차단 시에는 0을, 사용자 차단에서 차단 해제 시에는 -1을 입력하시면 됩니다.";
            var enterEasilyLink = document.createElement("a");
            enterEasilyLink.innerText = "차단기간 간편하게 입력하기";
            enterEasilyLink.href = "#";
            enterEasilyLink.addEventListener('click', function (evt) {
               evt.preventDefault();
               enterEasily();
            })
            expireSelect.parentNode.insertBefore(newExpireInput, expireSelect);
            expireSelect.parentNode.insertBefore(explain, expireSelect);
            expireSelect.parentNode.insertBefore(document.createElement("br"), expireSelect);
            expireSelect.parentNode.insertBefore(enterEasilyLink, expireSelect);
            expireSelect.parentNode.removeChild(expireSelect);
         }
         if (expireSelect != null) {
            var replaceExpireLink = document.createElement("a");
            replaceExpireLink.href = "#";
            replaceExpireLink.innerText = "초 단위로 차단 기간 입력하기";
            replaceExpireLink.addEventListener('click', function (evt) {
               evt.preventDefault();
               replaceExpireSelect();
               replaceExpireLink.parentNode.removeChild(replaceExpireLink);
            });
            expireSelect.parentNode.insertBefore(replaceExpireLink, expireSelect.nextSibling);
         }
      } else if (ENV.IsHistory) {
         addArticleButton('리버전 점프', function () {
            var revNo = prompt('보고 싶은 리버전 번호를 입력하세요.')
               .trim();
            if (revNo.indexOf('r') == 0) revNo = revNo.substring(1);
            if (/[^0-9]/.test(revNo)) {
               alert('올바른 입력이 아닙니다! r1 혹은 1과 같이 입력해주세요.');
               return;
            }
            location.href = "/w/" + encodeURIComponent(ENV.docTitle) + "?rev=" + revNo;
         })
         var historyRows = document.querySelectorAll('.wiki-article .wiki-list li');
         for (let historyRow of [].slice.call(historyRows)) {
            let revisionNo = historyRow.querySelector('strong')
               .textContent.trim();
            // 긴급차단
            if (SET.addQuickBlockLink) {
               let temp = historyRow.querySelector('span')
                  .innerHTML.trim();
               historyRow.querySelector('span')
                  .innerHTML = temp.substring(0, temp.length - 1) + ' | <a href="#" class="nf-history-quickblock">차단</a>)';
               historyRow.querySelector('a.nf-history-quickblock')
                  .addEventListener('click', (evt) => {
                     evt.preventDefault();
                     let user = historyRow.querySelectorAll('a');
                     user = user[user.length - 1].textContent.trim();
                     quickBlockPopup({
                        author: {
                           name: user,
                           isIP: validateIP(user)
                        },
                        defaultDuration: SET.quickBlockDefaultDuration,
                        defaultReason: SET.quickBlockReasonTemplate_history.replace(/\$\{host\}/g, location.host)
                           .replace(/\$\{revisionNo\}/g, revisionNo)
                           .replace(/\$\{docName\}/g, ENV.docTitle)
                     });
                  });
            }
            // ACL 가독성
            var italicTag = historyRow.querySelector('i');
            if (italicTag) {
               var pattern = /\(([a-zA-Z,]+?)으로 ACL 변경\)/;
               // 열람 수정 삭제 (한국) 토론 이동
               var valuePatternWithBlockKorea = /(admin|member|everyone),(admin|member|everyone),(admin|member|everyone),(true|false),(admin|member|everyone),(admin|member|everyone)/;
               var valuePattern = /(admin|member|everyone),(admin|member|everyone),(admin|member|everyone),(admin|member|everyone),(admin|member|everyone)/;
               var icons = ['ion-eye fa fa-eye', 'ion-edit fa fa-edit', 'ion-trash-a fa fa-trash', 'ion-android-textsms fa fa-comments', 'ion-arrow-right-c fa fa-arrow-right', 'ion-flag fa fa-flag'];
               var koreanAclConds = {
                  'member': '회원',
                  'admin': '관리자',
                  'everyone': '모두'
               };
               if (pattern.test(italicTag.innerHTML)) {
                  var aclText = pattern.exec(italicTag.innerHTML)[1];
                  var newAclText = '';
                  var acl = null,
                     isKoreaBlocked = null;
                  var matched = false;
                  if (aclText == 'delete') {
                     newAclText = '(ACL 초기화)';
                     matched = true;
                  } else if (valuePatternWithBlockKorea.test(aclText)) {
                     acl = valuePatternWithBlockKorea.exec(aclText);
                     isKoreaBlocked = acl[4] == 'true';
                     acl = [acl[0], acl[1], acl[2], acl[3], acl[5], acl[6]];
                     matched = true;
                  } else if (valuePattern.test(aclText)) {
                     acl = valuePattern.exec(aclText);
                     matched = true;
                  }
                  if (!matched) continue;
                  if (newAclText == '') {
                     newAclText = '(';
                     for (var i = 1; i <= 5; i++) {
                        var color = acl[i] == 'admin' ? 'red' : acl[i] == 'member' ? 'orange' : null;
                        newAclText += '<span ' + (color ? 'style="color:' + color + '" ' : '') + '><span class="icon ' + icons[i - 1] + '"></span>' + koreanAclConds[acl[i]] + '</span>,';
                     }
                     if (isKoreaBlocked) {
                        newAclText += '<span style="color: blue;"><span class="icon ' + icons[5] + '"></span>한국 IP 차단</span>,';
                     }
                     newAclText = newAclText.substring(0, newAclText.length - 1);
                     newAclText += '으로 ACL 변경)';
                  }
                  italicTag.innerHTML = italicTag.innerHTML.replace(pattern.exec(italicTag.innerHTML)[0], newAclText);
               }
            }
            // 빠른 되돌리기
            if (SET.fastRevert) {
               let revertLink = historyRow.querySelector('a[href^="/revert/"]');
               let wikiUrl = 'https://namu.wiki/w/' + encodeURIComponent(ENV.docTitle);
               revertLink.addEventListener('click', function (evt) {
                  evt.preventDefault();
                  let log = SET.fastRevertDefaultLog || '';
                  if (SET.askFastRevertLog) {
                     log = prompt('되돌리기 사유를 입력하세요.', SET.fastRevertDefaultLog);
                  }
                  if (log != null) {
                     namuapi.tryRevert({
                           rev: revisionNo.substring(1),
                           docname: ENV.docTitle,
                           user: ENV.UserName,
                           log: log
                        })
                        .then((success) => {
                           location.href = wikiUrl;
                        })
                        .catch((message) => {
                           location.href = evt.target.href;
                        });
                     }
               });
            }
         }
      } else if (ENV.IsRecentChanges) {
         let changeRows = document.querySelectorAll('article table.table tbody tr');
         for (let row of changeRows) {
            if (!row.querySelector('a')) continue; // 편집 코멘트 필요없음.
            let author = {
               name: row.querySelector('td:nth-child(2) a')
                  .textContent.trim()
            }
            author.isIP = validateIP(author.name);
            if (SET.addQuickBlockLink) {
               let quickBlockAnchor = document.createElement("a");
               quickBlockAnchor.textContent = " [차단] "
               quickBlockAnchor.href = "#";
               quickBlockAnchor.addEventListener('click', (evt) => {
                  evt.preventDefault();
                  quickBlockPopup({
                     author: author,
                     defaultReason: '긴급차단 - 문서 훼손',
                     defaultDuration: SET.quickBlockDefaultDuration
                  });
               })
               row.querySelector('td:first-child')
                  .insertBefore(quickBlockAnchor, row.querySelector('td:first-child span'));
            }
         }
      }
      if (ENV.IsEditRequest) {
         if (SET.addQuickBlockLink) {
            let quickBlockBtn = document.createElement('a');
            quickBlockBtn.className = 'btn btn-danger btn-lg';
            quickBlockBtn.href = '#';
            quickBlockBtn.textContent = 'Block';
            quickBlockBtn.addEventListener('click', e => {
               e.preventDefault();
               quickBlockPopup({
                  author: {
                     name: ENV.EditRequestAuthor,
                     isIP: validateIP(ENV.EditRequestAuthor)
                  },
                  defaultDuration: SET.quickBlockDefaultDuration,
                  defaultReason: location.href
               })
            });
            document.querySelector('.wiki-article .card .card-block').appendChild(quickBlockBtn);
         }
      }
      if (ENV.skinName == "liberty") {
         if (ENV.IsDocument) {
            addArticleButton("ACL", function () {
               location.href = "/acl/" + ENV.docTitle;
            })
         }
      }
   }
   // 아이덴티콘 버그 수정
   setInterval(function () {
      if (!/^\/discuss\/(.+?)/.test(location.pathname)) {
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
   addItemToMemberMenu("NamuFix 설정", async function (evt) {
      evt.preventDefault();
      var win = TooSimplePopup();
      var elems = {};
      win.title('NamuFix 설정');
      await SET.load();
      win.content(async function (el) {
         el.className += " NFSettingsContainer";
         el.innerHTML = `<style>.NFSettingsContainer h1 {font-size: 17pt; margin-left: 8px;} .NFSettingsContainer h2 {font-size: 13pt; margin-left: 8px;} .NFSettingsContainer .settings-paragraph {margin-left: 8px;}</style>
            <h1>NamuFix 전역</h1>
            <div class="settings-paragraph">
            <h2>IP정보 조회시 기관명</h2>
            <div class="settings-paragraph">
            <p>IP정보 조회시에 무슨 기관명을 이용할지 결정합니다. 아래 설정에서 KISA WHOIS 결과에서의 기관명이 선택됐는데 KISA WHOIS 결과가 조회되지 않을 시 자동으로 ipinfo.io에서 조회됩니다. 이 설정은 KISA WHOIS 조회를 제외한 모든 IP정보 조회를 동반한 기능(예: 토론시 익명 기여자 IP주소 조회, 익명 기여자 기여목록에서의 IP 정보 등)에 영향을 끼칩니다.</p>
            <input type="radio" name="ipInfoDefaultOrg" data-setname="ipInfoDefaultOrg" data-setvalue="ipinfo.io">ipinfo.io에서 조회 (기본값)<br>
            <input type="radio" name="ipInfoDefaultOrg" data-setname="ipInfoDefaultOrg" data-setvalue="KISAuser">KISA WHOIS 결과에서 IP 이용 기관명<br>
            <input type="radio" name="ipInfoDefaultOrg" data-setname="ipInfoDefaultOrg" data-setvalue="KISAISP">KISA WHOIS 결과에서 IP 보유 기관명<br>
            <input type="radio" name="ipInfoDefaultOrg" data-setname="ipInfoDefaultOrg" data-setvalue="KISAuserOrISP">KISA WHOIS 결과에서 IP 보유 기관명 혹은 IP 이용 기관명<br>
            </div>
            <h2>동시 요청 제한</h2>
            <div class="settings-paragraph">
            관리작업시의 동시 요청 제한 : 
            <input type="number" data-setname="adminReqLimit"></input><br>
            이미지 업로드시의 동시 요청 제한 : 
            <input type="number" data-setname="fileUploadReqLimit"></input><br>
            IP이용자의 기여목록에서 차단기록 검색 딜레이 : 
            <input type="number" data-setname="ipBlockHistoryCheckDelay"></input>ms (1000ms=1초)
            <br><strong>경고 : 너무 높게 설정하면 reCAPTCHA가 뜹니다.</strong>
            </div>
            <h2>IP Quality Score 이용</h2>
            <div class="settings-paragraph">
            KISA WHOIS 조회시 IP Quality Score 웹사이트에서 fraud score등의 추가적인 정보를 조회합니다.<br><strong>모바일여부, 기기 모델명, 기기 브랜드, 운영체제, 브라우저 등 기기와 관련된 정보는 참고하지 마십시오.</strong><br>
            <input type="checkbox" name="lookupIqsOnKisaWhois" data-setname="lookupIqsOnKisaWhois" data-as-boolean> IP Quality Score 이용</input>
            </div>
            <h2>umi 쿠키</h2>
            <div class="settings-paragraph">
            <p>NamuFix 실행시 umi 쿠키값을 다음과 같이 변경합니다. 공백으로 설정시 변경하지 않습니다.</p>
            <input type="text" data-setname="umiCookie"></input>
            </div>
            </div>
            <h1>토론 편의성</h1>
            <div class="settings-paragraph">
            <h2>토론 아이덴티콘</h2>
            <div class="settings-paragraph">
            <input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="icon">디시라이트 갤러콘 방식<br>
            <input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="headBg">스레딕 헬퍼 방식<br>
            <input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="identicon">아이덴티콘<br>
            <input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="none">사용 안함
            </div>
            <h2>아이덴티콘 라이브러리</h2>
            <div class="settings-paragraph">
            <p>참고 : NamuFix에서 특정 사용자의 이메일 주소를 조회할 수 없기에 Gravatar, Gravatar(monsterid)는 해당 사용자의 그라바타와 다르게 나옴.</p>
            <input type="radio" name="identiconLibrary" data-setname="identiconLibrary" data-setvalue="identicon">stewartlord/identicon.js (GitHub스타일의 아이덴티콘)<br>
            <input type="radio" name="identiconLibrary" data-setname="identiconLibrary" data-setvalue="jdenticon">jdenticon (원을 포함하는 여러 도형과 다양한 색으로 이루어진 아이덴티콘)<br>
            <input type="radio" name="identiconLibrary" data-setname="identiconLibrary" data-setvalue="gravatar">Gravatar (Gravatar에서 생성되는 기하학적 패턴 기반의 아이덴티콘)<br>
            <input type="radio" name="identiconLibrary" data-setname="identiconLibrary" data-setvalue="robohash">RoboHash
            &nbsp;(<input type="radio" name="robohashSet" data-setname="robohashSet" data-setvalue="set1">로봇</input>
            &nbsp;<input type="radio" name="robohashSet" data-setname="robohashSet" data-setvalue="set2">몬스터</input>
            &nbsp;<input type="radio" name="robohashSet" data-setname="robohashSet" data-setvalue="set3">로봇 머리</input>
            &nbsp;<input type="radio" name="robohashSet" data-setname="robohashSet" data-setvalue="set4">고양이</input>
            &nbsp;<input type="radio" name="robohashSet" data-setname="robohashSet" data-setvalue="any">랜덤</input>)
            </div>
            <h2>토론에서 익명 기여자 IP주소 조회</h2>
            <div class="settings-paragraph">
            <p>VPNGate 여부, 통신사, 국가이미지를 IP 주소 옆에 표시합니다. 요청 수가 많을 시 실패할 수 도 있습니다.</p>
            <input type="checkbox" name="lookupIPonDiscuss" data-setname="lookupIPonDiscuss" data-as-boolean>토론시 익명 기여자 IP 주소 조회</input><br>
            <input type="checkbox" name="checkWhoisNetTypeOnDiscuss" data-setname="checkWhoisNetTypeOnDiscuss" data-as-boolean>네트워크 유형도 함께 조회 (단 한국 IP만 가능)</input>
            </div>
            <h2>토론에서 블라인드된 쓰레드 부분숨기기</h2>
            <div class="settings-paragraph">
            <p>토론에서 블라인드된 쓰레드의 내용부분을 숨깁니다.</p>
            <input type="checkbox" name="hideHiddenResBody" data-setname="hideHiddenResBody" data-as-boolean>토론에서 블라인드된 쓰레드 부분 숨기기</input>
            </div>
            <h2>토론에서 보여지지 않은 쓰레도 불러오기</h2>
            <div class="settings-paragraph">
            <p>보여지지 않은 쓰레드도 불러오도록 나무위키 토론 스크립트를 수정합니다.</p>
            <input type="checkbox" name="loadUnvisibleReses" data-setname="loadUnvisibleReses" data-as-boolean>보여지지 않은 토론 쓰레도 불러오기</input>
            </div>
            <h2>토론 아이덴티콘 명도</h2>
            <div class="settings-paragraph">
            <p>스레딕 헬퍼 방식을 사용하는 경우에만 적용됩니다.</p>
            <label for="discussIdentiLightness">명도</label><input name="discussIdentiLightness" data-setname="discussIdentiLightness" type="range" max="1" min="0" step="0.01"><br>
            <label for="discussIdentiSaturation">순도</label><input name="discussIdentiSaturation" data-setname="discussIdentiSaturation" type="range" max="1" min="0" step="0.01">
            </div>
            <h2>토론시 앵커 미리보기</h2>
            <div class="settings-paragraph">
            <input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="0">사용하지 않음<br>
            <input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="1">마우스를 올리면 미리보기 표시<br>
            <input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="2">토론 메세지 위에 인용형식으로 표시<br>
            <input type="checkbox" name="removeNFQuotesInAnchorPreview" data-setname="removeNFQuotesInAnchorPreview" data-as-boolean>토론 메세지 위에 인용형식으로 표시할때, 인용문 안에 인용 형식으로 표시된 미리보기 제거
            </div>
            <h2>보지 않는 토론 알림</h2>
            <div class="settings-paragraph">
            <p>보지 않는 토론(예 : 탭 여러개를 여는 경우)에 새로운 발언 혹은 블라인드가 생길시 브라우저 API를 이용해 알림을 띄웁니다.<br>
            참고 : 토론에서 보여지지 않은 쓰레도 불러오기 기능이 활성화된 경우 보이지 않은 쓰레들을 불려오는 동안은 알림이 뜨지 않습니다.<br>
            경고 : 현재 실험중인 기능입니다.</p>
            <input type="checkbox" data-setname="notifyForUnvisibleThreads" data-as-boolean>보지 않는 토론 알림</input>
            </div>
            <h2>마우스를 올리면 해당 사용자의 다른 쓰레 강조</h2>
            <div class="settings-paragraph">
            <p>토론에서 쓰레에 마우스를 올리면 그 사용자의 다른 쓰레를 강조합니다.</p>
            <input type="checkbox" data-setname="emphasizeResesWhenMouseover" data-as-boolean>마우스를 올리면 해당 사용자의 다른 쓰레 강조</input>
            </div>
            </div>
            <h1>관리 편의성</h1>
            <div class="settings-paragraph">
            <h2>편의기능</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="addBatchBlockMenu" data-setname="addBatchBlockMenu" data-as-boolean>일괄 차단 메뉴 추가</input><br>
            <input type="checkbox" name="addQuickBlockLink" data-setname="addQuickBlockLink" data-as-boolean>빠른 차단 링크 추가</input><br>
            토론중 빠른차단 기능에서의 차단사유 템플릿 : <input type="text" data-setname="quickBlockReasonTemplate_discuss" style="width: 500px; max-width: 75vw;"></input><br>
            역사페이지 빠른차단 기능에서의 차단사유 템플릿 : <input type="text" data-setname="quickBlockReasonTemplate_history" style="width: 500px; max-width: 75vw;"></input><br>
            <strong>참고:</strong> 문서명(\${docName})은 URL 인코딩이 되지 않고 리버전 번호(\${revisionNo})는 r로 시작하기 때문에 주소형태의 차단사유 템플릿을 쓰는 것을 권장하지 않습니다.)<br>
            빠른차단 기능에서의 차단기간 기본값(초) : <input type="text" data-setname="quickBlockDefaultDuration"></input>
            </div>
            <h2>토론에서의 관리 편리성</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="addBatchBlindButton" data-setname="addBatchBlindButton" data-as-boolean>일괄 블라인드 버튼 추가</input><br>
            <input type="checkbox" name="slientBlind" data-setname="slientBlind" data-as-boolean>새로고침 없는 블라인드</input><br>
            일괄 블라인드 버튼을 누르면 체크된(설정 활성화시 체크박스가 생깁니다) 메세지들이 블라인드됩니다. 블라인드 해제 버튼은 체크된 메세지들의 블라인드를 해제합니다.<br>
            새로고침 없는 블라인드를 누르면 기존 블라인드 버튼(<em>[ADMIN]</em>으로 시작하는 버튼)을 누를 시 새로고침을 하지 않습니다.<br>
            <strong>[경고] 위 두 기능들은 버그가 있을 수 있습니다.</strong>
            </div>
            <h2>편집요청 일괄 닫기 메뉴</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="addEditRequestCloseMenu" data-setname="addEditRequestCloseMenu" data-as-boolean></input>편집요청 일괄 닫기 메뉴 추가<br>
            편집 요청 닫기 사유 기본값 : <input type="text" name="defaultEditRequestCloseReason" data-setname="defaultEditRequestCloseReason"></input><br>
            편집요청 일괄 닫기 메뉴를 추가합니다.<br>
            사용 방법 : 닫을 편집요청들을 체크박스로 선택하고 <strong>선택한 요청 닫기</strong> 버튼을 눌러 닫으시면 됩니다. 체크박스 옆에 라디오 두개는 선택을 도와주는 목적으로, 역사 페이지의 그것을 떠올리며 직접 써보시면 바로 이해하실 수 있습니다.
            </div>
            </div>
            <h1>편집 편의성</h1>
            <div class="settings-paragraph">
            <h2>자동저장 시간 간격</h2>
            <div class="settings-paragraph">
            <p>편집중 자동저장 간격을 설정합니다. 0 이하의 값으로 설정할 시 자동으로 이루어지지 않으며 이 경우 단축키나 메뉴를 이용해 수동으로 저장해야 합니다.</p>
            <input type="number" name="autoTempsaveSpan" data-setname="autoTempsaveSpan"></input>ms (1000ms = 1s)
            </div>
            <h2>빠른 되돌리기</h2>
            <div class="settings-paragraph">
            <p>빠른 되돌리기 기능을 활성화하면 되돌리기 페이지가 뜨지 않고 즉시 되돌리기됩니다. 실패시 되돌리기 페이지가 표시됩니다. 설정을 통해 사유를 입력받을 수도 있습니다.</p>
            <input type="checkbox" name="fastRevert" data-setname="fastRevert" data-as-boolean>빠른 되돌리기 사용</input><br>
            <input type="checkbox" name="askFastRevertLog" data-setname="askFastRevertLog" data-as-boolean>빠른 되돌리기시 사유 묻기</input><br>
            빠른 되돌리기 사유 기본값 : <input type="text" data-setname="fastRevertDefaultLog"></input>
            </div>
            <h2>이미지 업로드시 파일이름 유지</h2>
            <div class="settings-paragraph">
            <p>파일이름에 난수를 덧붙이지 않고 그대로 유지합니다. 파일이름이 중복될시 오류가 발생할 수 있습니다.</p>
            <input type="checkbox" data-setname="unprefixedFilename" data-as-boolean>파일이름 그대로 유지</input>
            </div>
            </div>
            <h1>게시판</h1>
            <div class="settings-paragraph">
            <h2>게시판 시간대 변경</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="noLocaltimeOnNamuBoard" data-setname="noLocaltimeOnNamuBoard" data-as-boolean>게시판 시간대를 사용자의 시간대로 자동 변경합니다.</input>
            </div>
            <h2>댓글 사용구</h2>
            <div class="settings-paragraph">
            <p>상용구와 상용구는 ,로 구분하며 상용구 이름과 상용구 내용은 :로 구분합니다. (예시: <em>처리중:처리중입니다,기각:기각합니다</em>)</p>
            <input type="text" data-setname="commentMacros"></input>
            </div>
            <h2>게시판 아카이브 사이트</h2>
            <div class="settings-paragraph">
            <p>게시글 아카이브에 이용할 사이트를 선택할 수 있습니다.</p>
            <input type="radio" name="defaultBoardArchiver" data-setname="defaultBoardArchiver" data-setvalue="namuwikiml">namuwiki.ml (kiwitree 운영)</input><br>
            </div>
            <h2>기여내역 링크화</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="userContribLinkOnBoard" data-setname="userContribLinkOnBoard" data-as-boolean>게시글 목록내 작성자명, 게시글 작성자명, 댓글 작성자명을 기여내역 링크로 바꿉니다.</input>
            <p>게시글 목록내 작성자명, 게시글을 볼 때 게시글 상단의 작성자명, 댓글에서 댓글 작성자명을 그 사람의 기여내역 링크로 바꿉니다. 디자인의 변화는 없습니다.</p>
            </div>
            <h1>기타</h1>
            <div class="settings-paragraph">
            <h2>SNS 공유 버튼</h2>
            <div class="settings-paragraph">
            <input type="checkbox" name="addSnsShareButton" data-setname="addSnsShareButton" data-as-boolean>문서에 트위터/페이스북 공유 버튼을 추가합니다.</input>
            </div>
            </div>`
         var optionTags = document.querySelectorAll('[data-setname]');
         await SET.load();
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
      win.button('저장하고 닫기', async function () {
         var optionTags = document.querySelectorAll('[data-setname]');
         await SET.load();
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
         await SET.save();
         if (confirm("새로고침해야 설정이 적용됩니다. 새로고침할까요?")) location.reload();
         win.close();
      });
      win.button('설정 백업', async function () {
         let excludeTempsaves = confirm('임시조치를 제외할까요?');
         let excludes = [];
         if (excludeTempsaves) excludes.push('tempsaves');
         let backupText = [JSON.stringify(await SET.export(excludes))];
         let win = TooSimplePopup();
         win.title('백업중...');
         win.content(el => el.innerHTML = "백업중...");
         let blob = new Blob(backupText, {
            type: "application/json"
         });
         let url = URL.createObjectURL(blob);
         win.content(el => el.innerHTML = `<a href="${url}" download="namufix_backup.json">이 링크</a>을 다른 이름으로 저장해주세요.`)
         win.button('닫기', win.close);
      });
      win.button('설정 복원', async function () {
         getFile(async (files) => {
            if (files.length === 0) return alert('아무것도 선택하지 않았습니다!');
            try {
               let fileReader = new FileReader();
               fileReader.onload = async (evt) => {
                  try {
                     let data = JSON.parse(evt.target.result);
                     await SET.import(data);
                     alert('완료했습니다. 확인 버튼을 누르면 새로고침됩니다.');
                     location.reload();
                  } catch (err) {
                     return alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
                     console.error(err);
                  }
               }
               fileReader.readAsText(files[0]);
            } catch (err) {
               return alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
               console.error(err);
            }
         }, false)
      });
      win.button('설정 초기화', async function () {
         if (confirm('되돌릴 수 없습니다. 계속 진행하시겠습니까?')) {
            await SET.load();
            for (let i in SET) {
               if (i == "save" || i == "load" || i == "delete") continue;
               await SET.delete(i);
            }
            if (confirm('초기화에 성공했습니다. 확인 버튼을 누르면 새로고침합니다.')) {
               location.reload();
            }
            win.close();
         }
      });
   });
   addItemToMemberMenu('NamuFix 이슈트래커', function (evt) {
      evt.preventDefault();
      GM.openInTab("https://github.com/LiteHell/NamuFix/issues");
   });
   addItemToMemberMenu('KISA WHOIS', function (evt) {
      evt.preventDefault();
      whoisPopup(prompt('조회할 IP 주소를 입력하세요.'));
   })
   if (SET.addBatchBlockMenu) {
      addItemToMemberMenu('계정/IP 일괄 차단', batchBlockFunction)
   }
   listenPJAX(mainFunc);
   await mainFunc();
   if (SET.addEditRequestCloseMenu)
      addItemToMemberMenu('편집요청 일괄 닫기', function (evt) {
         evt.preventDefault();
         editRequestBlockPopup();
      })
   if (GM.info.scriptHandler === "Greasemonkey" && GM.info.version.startsWith("4.") && !SET.ignoreGM4Warning) {
      var win = TooSimplePopup();
      win.title('Greasemonkey 4와의 호환성 안내');
      win.content((container) => container.innerHTML = "<p>Greasemonkey 4+ 버전에서는 NamuFix가 비정상적으로 작동할 가능성이 <strong>매우</strong> 높습니다. 버그를 작동하면 즉시 이슈트래커에 신고해주세요.</p>");
      win.button('닫기', win.close);
      SET.ignoreGM4Warning = true;
      await SET.save();
   }
})(SET);
