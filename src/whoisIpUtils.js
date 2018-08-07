function whoisIpUtils() {
  let ipDictionary = {};
  this.getIpInfo = (ip, cb) => {
    if (ipDictionary[ip])
      return cb(ipDictionary[ip]);
    GM.xmlHttpRequest({
      method: "GET",
      url: `http://ipinfo.io/${ip}/json`,
      onload: function (res) {
        var resObj = JSON.parse(res.responseText);
        if (res.status === 200 || res.status === 304) {
          if (/^AS[0-9]+ /.test(resObj.org)) {
            resObj.org = resObj.org.replace(/^AS[0-9]+ /, '');
          }
          if (SET.ipInfoDefaultOrg != 'ipinfo.io') {
            getIpWhois(ip, function (whoisRes) {
              if (!whoisRes.success || whoisRes.raw) {
                ipDictionary[ip] = resObj;
                cb(resObj);
                return;
              }
              var koreanISP = null,
                koreanUser = null;
              if (whoisRes.result.korean && whoisRes.result.korean.ISP && whoisRes.result.korean.ISP.netinfo && whoisRes.result.korean.ISP.netinfo.orgName) {
                koreanISP = whoisRes.result.korean.ISP.netinfo.orgName;
              } else if (whoisRes.result.korean && whoisRes.result.korean.user && whoisRes.result.korean.user.netinfo && whoisRes.result.korean.user.netinfo.orgName) {
                koreanUser = whoisRes.result.korean.user.netinfo.orgName;
              }
              if (SET.ipInfoDefaultOrg === 'KISAuser' && koreanUser !== null) {
                resObj.org = koreanUser;
              } else if (SET.ipInfoDefaultOrg === 'KISAISP' && koreanISP !== null) {
                resObj.org = koreanISP;
              } else if (SET.ipInfoDefaultOrg === 'KISAuserOrISP' && (koreanUser !== null || koreanISP !== null)) {
                resObj.org = koreanUser !== null ? koreanUser : koreanISP;
              }
              ipDictionary[ip] = resObj;
              cb(resObj);
              return;
            });
          } else {
            ipDictionary[ip] = resObj;
            cb(resObj);
          }
        } else {
          cb(null);
        }
      }
    });
  }

  let whoisDictionary = {};

  this.getIpWhois = (ip, cb) => {
    if (whoisDictionary[ip])
      return cb(whoisDictionary[ip]);
    GM.xmlHttpRequest({
      method: "GET",
      url: `http://namufix.wikimasonry.org/whois/ip/${ip}`,
      onload: function (res) {
        var resObj = JSON.parse(res.responseText);
        whoisDictionary[ip] = resObj;
        cb(resObj);
      }
    });
  }

  let vpngateCache = [],
    vpngateCrawlledAt = -1;

  this.getVPNGateIPList = () => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url: "https://namufix.wikimasonry.org/vpngate/list",
        onload: function (res) {
          let resObj = JSON.parse(res.responseText);
          if (resObj.success)
            resolve(resObj.result);
          else
            reject(resObj.message);
        }
      });
    });
  };

  this.whoisPopup = (ip) => {
    if (ip === null || ip === "")
      return alert('ip주소를 입력해주세요');
    var win = TooSimplePopup();
    win.title('IP WHOIS 조회');
    win.button('다른 IP 조회', function () {
      var newip = prompt('IP 주소를 입력하세요.');
      win.close();
      whoisPopup(newip);
    })
    win.button('닫기', win.close);
    win.content(function (container) {
      container.innerHTML = '조회중입니다. 잠시만 기다려주세요...';
      getIpWhois(ip, function (result) {
        if (result.success && !result.raw) {
          var whoisObj = result.result;
          var currentView = 'table';
          container.innerHTML = '<p>NamuFix 서버를 통해 KISA WHOIS를 조회했습니다. 결과는 다음과 같습니다.(<a href="#" class="switchViewType">JSON 형식으로 보기</a>)</p><div class="whois-content"><table></table></div>';
          var resultContainer = container.querySelector('.whois-content');
          var switchViewLink = container.querySelector('a.switchViewType');

          function useTableView() {
            function writeSubInfoTable(subInfoObj, caption) {
              var table = document.createElement('table');
              table.className = "whois";
              table.innerHTML += '<caption>' + encodeHTMLComponent(caption) + '</caption>';
              table.innerHTML += '<thead><tr><th>이름</th><th>내용</th></tr></thead>';
              var tableHtml = '<tbody>';
              var koreanContactNames = {
                techContact: '네트워크 담당자 정보',
                adminContact: 'IP주소 관리자 정보',
                abuseContact: '네트워크 abuse 담당자 정보'
              };
              var koreanNetInfoNames = {
                // 주소범위(range), 프리픽스(prefix), 네트워크이름(servName), 기관명(orgname), 주소(addr), 우편번호(zipCode), 할당내역 등록일(regDate) 필드 포함
                addr: '주소',
                netType: '네트워크 구분',
                orgName: '기관명',
                orgID: '기관 ID',
                prefix: 'IP prefix',
                range: 'IP 범위',
                regDate: '등록일',
                servName: '네트워크 이름',
                zipCode: '우편번호'
              };
              for (var i in subInfoObj) {
                if (i == 'techContact' || i == 'adminContact' || i == 'abuseContact') {
                  tableHtml += '<tr><td colspan="2" class="whois-subheader">' + koreanContactNames[i] + '</td></tr>';
                  if (subInfoObj[i].name)
                    tableHtml += '<tr><td>이름</td><td>' + encodeHTMLComponent(subInfoObj[i].name) + '</td></tr>';
                  if (subInfoObj[i].phone)
                    tableHtml += '<tr><td>전화번호</td><td>' + encodeHTMLComponent(subInfoObj[i].phone) + '</td></tr>';
                  if (subInfoObj[i].email)
                    tableHtml += '<tr><td>연락처</td><td>' + encodeHTMLComponent(subInfoObj[i].email) + '</td></tr>';
                } else if (i == 'netinfo') {
                  // KISA 씨발놈들.... API 설명서에 다 적어두지...
                  tableHtml += '<tr><td colspan="2" class="whois-subheader">네트워크 정보</td></tr>';
                  for (var na in subInfoObj[i]) {
                    tableHtml += '<tr><td>' + (koreanNetInfoNames[na] ? koreanNetInfoNames[na] : na) + '</td><td>' + encodeHTMLComponent(subInfoObj[i][na]) + '</td></tr>';
                  }
                }
              }
              tableHtml += '</tbody>';
              table.innerHTML += tableHtml;
              return table;
            }
            switchViewLink.innerText = '(진행중입니다)';
            currentView = 'progress';
            resultContainer.innerHTML = '<p>(진행중입니다.)</p>'

            function writeRest() {
              if (whoisObj.korean && whoisObj.korean.ISP)
                resultContainer.appendChild(writeSubInfoTable(whoisObj.korean.ISP, "IP 주소 보유기관 정보 (국문)"));
              if (whoisObj.korean && whoisObj.korean.user)
                resultContainer.appendChild(writeSubInfoTable(whoisObj.korean.user, "IP 주소 이용기관 정보 (국문)"));
              if (whoisObj.english && whoisObj.english.ISP)
                resultContainer.appendChild(writeSubInfoTable(whoisObj.english.ISP, "IP 주소 보유기관 정보 (영문)"));
              if (whoisObj.english && whoisObj.english.user)
                resultContainer.appendChild(writeSubInfoTable(whoisObj.english.user, "IP 주소 이용기관 정보 (영문)"));
              switchViewLink.innerText = 'JSON 형식으로 보기';
              currentView = 'table';
            }
            if (whoisObj.countryCode == 'none') {
              resultContainer.innerHTML = '<style>.whois-subheader {background: #9D75D9; color: white; text-align: center;} table.whois tr, table.whois td{border: 1px #9D75D9 solid; border-collapse: collapse;} table.whois td {padding: 5px;} table.whois caption { caption-side: top; }</style>' +
                '<table class="whois"><caption>쿼리 정보</caption>' +
                '<thead><th>이름</th><th>내용</th></tr></thead>' +
                '<tbody>' +
                '<tr><td>쿼리</td><td>' + whoisObj.query + '</td></tr>' +
                '<tr><td>쿼리 유형</td><td>' + whoisObj.queryType + '</td></tr>' +
                '<tr><td>레지스트리</td><td>' + whoisObj.registry + '</td></tr>' +
                '<tr><td>등록 국가</td><td><span class="icon ion-android-star"></span> 없음 (루프백같이 특수한 경우)</td></tr>' +
                '</tbody></table>';
              writeRest();
            } else {
              getFlagIcon(whoisObj.countryCode.toLowerCase(), function (flagIconData) {
                resultContainer.innerHTML = '<style>.whois-subheader {background: #9D75D9; color: white; text-align: center;} table.whois tr, table.whois td{border: 1px #9D75D9 solid; border-collapse: collapse;} table.whois td {padding: 5px;} table.whois caption { caption-side: top; }</style>' +
                  '<table class="whois"><caption>쿼리 정보</caption>' +
                  '<thead><th>이름</th><th>내용</th></tr></thead>' +
                  '<tbody>' +
                  '<tr><td>쿼리</td><td>' + whoisObj.query + '</td></tr>' +
                  '<tr><td>쿼리 유형</td><td>' + whoisObj.queryType + '</td></tr>' +
                  '<tr><td>레지스트리</td><td>' + whoisObj.registry + '</td></tr>' +
                  '<tr><td>등록 국가</td><td><img style="height: 1em;" src="' + flagIconData + '">' + korCountryNames[whoisObj.countryCode.toUpperCase()] + '</td></tr>' +
                  '</tbody></table>';
                writeRest();
              });
            }
          }

          function useJsonView() {
            switchViewLink.innerText = '표 형식으로 보기';
            currentView = 'json';
            resultContainer.innerHTML = '<textarea readonly style="width: 50vw; height: 600px; max-height: 90vh;"></textarea>';
            resultContainer.querySelector('textarea').value = JSON.stringify(whoisObj);
          }
          switchViewLink.addEventListener('click', function (evt) {
            evt.preventDefault();
            if (currentView == 'json') {
              useTableView();
            } else if (currentView == 'table') {
              useJsonView();
            } else if (currentView == 'progress') {
              alert('잠시만 기다려주세요.');
            }
          })
          useTableView();
        } else if (result.success && result.raw) {
          container.innerHTML = '<p>NamuFix 서버에서 다음과 같은 WHOIS 결과를 얻었습니다.</p><textarea readonly style="width: 50vw; height: 600px; max-height: 80vh;"></textarea>';
          container.querySelector('textarea').value = result.result;
        } else if (result.error.namufix) {
          alert('NamuFix 서버측에서 오류가 발생했습니다.\n\n메세지 : ' + result.error.message + '\n오류 코드 : ' + result.error.code);
          win.close();
        } else if (result.error.kisa) {
          container.innerHTML = '<p>KISA WHOIS 조회결과 다음과 같은 오류가 반환됐습니다.</p><p><em>' + result.error.message + '</em></p><p>오류 코드는 ' + result.error.code + '입니다.</p>';
        }
      });
    });
  }

  this.checkVPNGateIP = async (ip) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url: "https://namufix.wikimasonry.org/vpngate/check/" + encodeURIComponent(ip),
        onload: function (res) {
          let resObj = JSON.parse(res.responseText);
          if (resObj.success)
            resolve(resObj.result);
          else
            reject(resObj.message);
        }
      });
    });
  }
}