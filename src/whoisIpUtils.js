function IsObjectSubsetOf(a, b) {
    for (let i in a) {
        if (!b[i]) return false;
        if (b[i] !== a[i]) return false;
    }
    return true;
}

function whoisIpUtils() {
    let ipDictionary = {};
    this.getIpInfo = (ip, cb) => {
        if (ipDictionary[ip]) return cb(ipDictionary[ip]);
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
                            let koreanISP = (whoisRes.result.items.filter(v => IsObjectSubsetOf({
                                    language: 'korean',
                                    infoOf: 'isp',
                                    infoName: 'netinfo',
                                    name: 'orgName'
                                }, v))[0] || {
                                    value: null
                                })
                                .value,
                                koreanUser = (whoisRes.result.items.filter(v => IsObjectSubsetOf({
                                    language: 'korean',
                                    infoOf: 'user',
                                    infoName: 'netinfo',
                                    name: 'orgName'
                                }, v))[0] || {
                                    value: null
                                })
                                .value;
                            if (SET.ipInfoDefaultOrg === 'KISAuser' && koreanUser) {
                                resObj.org = koreanUser;
                            } else if (SET.ipInfoDefaultOrg === 'KISAISP' && koreanISP) {
                                resObj.org = koreanISP;
                            } else if (SET.ipInfoDefaultOrg === 'KISAuserOrISP' && (koreanUser || koreanISP)) {
                                resObj.org = koreanUser ? koreanUser : koreanISP;
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
    this.getIpWhois = function (a,b,c) {
        let ip, cb, opts = {iqs: false};
        if (arguments.length === 2) [ip, cb] = Array.from(arguments);
        else if (arguments.length === 3) [ip, opts, cb] = Array.from(arguments);
        let reqIqs = opts ? opts.iqs || false : false;
        if (whoisDictionary[ip]) return cb(whoisDictionary[ip]);
        GM.xmlHttpRequest({
            method: "GET",
            url: `http://namufix.wikimasonry.org/whois/ip/${ip}?with_ip_quality_score=${reqIqs ? "1" : "0"}`,
            headers: {
                "User-Agent": `Mozilla/5.0 (compatible; NamuFix/${GM.info.script.version})`
            },
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
                    if (resObj.success) resolve(resObj.result);
                    else reject(resObj.message);
                }
            });
        });
    };
    this.whoisPopup = (ip, options) => {
        let whoisOptions = {iqs: options ? options.iqs || false : false};
        if (ip === null || ip === "") return alert('ip주소를 입력해주세요');
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
            getIpWhois(ip, whoisOptions, function (result) {
                function makeIqsTable(result, translations) {
                    let table = document.createElement('table');
                    table.className = "whois";
                    table.innerHTML += '<caption> IP Quailty Score 조회 결과 </caption>';
                    table.innerHTML += '<thead><tr><th>이름</th><th>내용</th></tr></thead>';
                    let tableHtml = '<tbody>';
                    for (let name in result) {
                        let displayedName = (translations[name] ? translations[name] : name);
                        tableHtml += '<tr><td>' + displayedName + '</td><td>' + encodeHTMLComponent(result[name]) + '</td></tr>';
                    }
                    tableHtml += '</tbody>';
                    table.innerHTML += tableHtml;
                    return table;
                }
                if (result.success && !result.raw) {
                    let whoisObj = result.result;
                    container.innerHTML = '<p>NamuFix 서버를 통해 KISA WHOIS를 조회했습니다. 결과는 다음과 같습니다.</p><div class="whois-content"><table></table></div>';
                    let resultContainer = container.querySelector('.whois-content');

                    function makeTable(items, caption) {
                        let table = document.createElement('table');
                        if (items.length === 0) return table;
                        table.className = "whois";
                        table.innerHTML += '<caption>' + encodeHTMLComponent(caption) + '</caption>';
                        table.innerHTML += '<thead><tr><th>이름</th><th>내용</th></tr></thead>';
                        let tableHtml = '<tbody>';
                        let infoNames = new Set(items.map(v => v.infoKorName || v.infoName));
                        for (let headerName of infoNames) {
                            tableHtml += '<tr><td colspan="2" class="whois-subheader">' + headerName + '</td></tr>';
                            for (let i of items.filter(v => v.infoKorName === headerName || v.infoName === headerName)) {
                                tableHtml += '<tr><td>' + (i.korName || i.name) + '</td><td>' + encodeHTMLComponent(i.value) + '</td></tr>';
                            }
                        }
                        tableHtml += '</tbody>';
                        table.innerHTML += tableHtml;
                        return table;
                    }

                    if (whoisObj.countryCode == 'none') {
                        resultContainer.innerHTML = '<style>.whois-subheader {background: #9D75D9; color: white; text-align: center;} table.whois tr, table.whois td{border: 1px #9D75D9 solid; border-collapse: collapse;} table.whois td {padding: 5px;} table.whois caption { caption-side: top; }</style>' + '<table class="whois"><caption>쿼리 정보</caption>' + '<thead><th>이름</th><th>내용</th></tr></thead>' + '<tbody>' + '<tr><td>쿼리</td><td>' + whoisObj.query + '</td></tr>' + '<tr><td>쿼리 유형</td><td>' + whoisObj.queryType + '</td></tr>' + '<tr><td>레지스트리</td><td>' + whoisObj.registry + '</td></tr>' + '<tr><td>등록 국가</td><td><span class="icon ion-android-star"></span> 없음 (루프백같이 특수한 경우)</td></tr>' + '</tbody></table>';
                    } else {
                        getFlagIcon(whoisObj.countryCode.toLowerCase())
                            .then(function (flagIconData) {
                                resultContainer.innerHTML = '<style>.whois-subheader {background: #9D75D9; color: white; text-align: center;} table.whois tr, table.whois td{border: 1px #9D75D9 solid; border-collapse: collapse;} table.whois td {padding: 5px;} table.whois caption { caption-side: top; }</style>' + '<table class="whois"><caption>쿼리 정보</caption>' + '<thead><th>이름</th><th>내용</th></tr></thead>' + '<tbody>' + '<tr><td>쿼리</td><td>' + whoisObj.query + '</td></tr>' + '<tr><td>쿼리 유형</td><td>' + whoisObj.queryType + '</td></tr>' + '<tr><td>레지스트리</td><td>' + whoisObj.registry + '</td></tr>' + '<tr><td>등록 국가</td><td><img style="height: 1em;" src="' + flagIconData + '">' + korCountryNames[whoisObj.countryCode.toUpperCase()] + '</td></tr>' + '</tbody></table>';
                                resultContainer.appendChild(makeTable(whoisObj.items.filter(v => IsObjectSubsetOf({
                                    language: 'korean',
                                    infoOf: 'isp'
                                }, v)), "IP 주소 보유기관 정보 (국문)"));
                                resultContainer.appendChild(makeTable(whoisObj.items.filter(v => IsObjectSubsetOf({
                                    language: 'korean',
                                    infoOf: 'user'
                                }, v)), "IP 주소 이용기관 정보 (국문)"));
                                resultContainer.appendChild(makeTable(whoisObj.items.filter(v => IsObjectSubsetOf({
                                    language: 'english',
                                    infoOf: 'isp'
                                }, v)), "IP 주소 보유기관 정보 (영문)"));
                                resultContainer.appendChild(makeTable(whoisObj.items.filter(v => IsObjectSubsetOf({
                                    language: 'english',
                                    infoOf: 'user'
                                }, v)), "IP 주소 이용기관 정보 (영문)"));
                                if (result.ipQualityScore) resultContainer.appendChild(makeIqsTable(result.ipQualityScore, result.ipQualityScoreTranslations))
                            });
                    }
                } else if (result.success && result.raw) {
                    container.innerHTML = '<p class="rawdesc">NamuFix 서버에서 다음과 같은 WHOIS 결과를 얻었습니다.</p><textarea readonly style="width: 50vw; height: 600px; max-height: 80vh;"></textarea>';
                    container.querySelector('textarea')
                        .value = result.result;
                    if (result.ipQualityScore) {
                        container.innerHTML += "<br><style>.whois-subheader {background: #9D75D9; color: white; text-align: center;} table.whois tr, table.whois td{border: 1px #9D75D9 solid; border-collapse: collapse;} table.whois td {padding: 5px;} table.whois caption { caption-side: top; }</style>";
                        container.querySelector(".rawdesc").textContent = "NamuFix 서버에서 다음과 같은 WHOIS 결과와 IP Quality Score 조회결과를 얻었습니다.";
                        container.appendChild(makeIqsTable(result.ipQualityScore, result.ipQualityScoreTranslations))
                    }
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
                    if (resObj.success) resolve(resObj.result);
                    else reject(resObj.message);
                }
            });
        });
    }
}
