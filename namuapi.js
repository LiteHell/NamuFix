var namuapi = {};

// /check 페이지 대응
namuapi.theseedRequest = function (options) {
    var _newoptions = {};
    for (var i in options) {
        if (i !== "onload") {
            _newoptions[i] = options[i];
        } else {
            _newoptions.onload = function (res) {
                console.log('[NamuFix] 위키 측으로부터 응답 받음.');
                var aTagForParsingUrl = document.createElement("a");
                aTagForParsingUrl.href = res.finalUrl;
                if (aTagForParsingUrl.pathname.indexOf("/check") === 0) {
                    console.log('[NamuFix] /check 페이지 감지됨.');
                    namuapi.resolveRecaptcha(function (capKeyRes) {
                        if (capKeyRes == null) {
                            namuapi.theseedRequest(options);
                        } else {
                            var formData = new FormData();
                            formData.append("g-recaptcha-response", capKeyRes);
                            GM_xmlhttpRequest({
                                url: aTagForParsingUrl.href,
                                method: 'POST',
                                data: formData,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                onload: function (checkRes) {
                                    console.log('[NamuFix] /check페이지에 g-recaptcha-response 전송함. 요청 재진행중...');
                                    namuapi.theseedRequest(options);
                                }
                            })
                        }
                    })
                } else {
                    options.onload(res);
                }
            };
        }
    }
    GM_xmlhttpRequest(_newoptions);
}

namuapi.resolveRecaptcha = function (callback) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://' + location.host + '/check',
        onload: function (res) {
            var siteKey = /["']sitekey["']: ["']([^"']+)["']/.exec(res.responseText)[1];
            var captchaWin = TooSimplePopup();
            captchaWin.title('reCAPTCHA 해결');
            captchaWin.content(function (winContainer) {
                var id = "nf-recaptcha-" + Date.now();
                var btnId = 'nf-communicate-' + Date.now();
                var cbName = "nfreCAPTCHACallback" + Date.now();
                winContainer.innerHTML = '<p>reCAPTCHA를 해결해주세요.</p><div id="' + id + '"></div><button style="display: none;" type="button" id="' + btnId + '"></button>';
                var injectedButton = winContainer.querySelector('#' + btnId);
                winContainer.querySelector('#' + id).dataset.callback = cbName;
                winContainer.querySelector('#' + id).dataset.sitekey = siteKey;
                injectedButton.addEventListener('click', function (evt) {
                    evt.preventDefault();
                    callback(injectedButton.dataset.recaptchaResponse);
                    captchaWin.close();
                })
                var scriptTag = document.createElement("script");
                scriptTag.innerHTML = 'function ' + cbName + '(recaptcha_response){var btn = document.getElementById("' + btnId + '"); btn.dataset.recaptchaResponse = recaptcha_response; btn.click();}function renderNFReCAPTCHA(){if(!window.grecaptcha) return setTimeout(renderNFReCAPTCHA, 200); window.grecaptcha.render(document.getElementById("' + id + '"));} setTimeout(renderNFReCAPTCHA, 200);';
                winContainer.appendChild(scriptTag);
            });
            captchaWin.button('닫기', function () {
                callback(null);
                captchaWin.close();
            })
        }
    });
}

// getRAW
namuapi.raw = function (title, onfound, onnotfound) {
    namuapi.theseedRequest({
        method: 'GET',
        url: 'https://' + location.host + '/raw/' + title,
        onload: function (res) {
            if (res.status == 404) {
                onnotfound(title);
                return;
            }
            onfound(res.responseText, title);
        }
    })
}

namuapi.searchBlockHistory = function (query, isAuthor, callback) {
    namuapi.theseedRequest({
        method: 'GET',
        url: 'https://' + location.host + '/BlockHistory?target=' + (isAuthor ? "author" : "text") + '&query=' + encodeURIComponent(query),
        onload: function (res) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(res.responseText, "text/html");
            if (doc.querySelector('article ul.wiki-list > li') == null)
                return callback([]);
            var logs = doc.querySelectorAll('article ul.wiki-list > li');
            var result = [];
            // get first entry only
            for (var i = 0; i < logs.length; i++) {
                var curLog = logs[i];
                var durationMatch = /\((.+?)\)/.exec(curLog.querySelector('i').nextSibling.textContent.trim());
                var entry = {
                    blocker: curLog.querySelector('strong > a').textContent.trim(),
                    blocked: /^사용자가\s+(.+)/.exec(curLog.querySelector('strong').nextSibling.textContent.trim())[1],
                    duration: durationMatch == null ? null : durationMatch[1],
                    reason: curLog.querySelector('span[style]') ? curLog.querySelector('span[style]').textContent : "",
                    type: /\((.+?)\)/.exec(curLog.querySelector('i').textContent)[1],
                    at: new Date(curLog.querySelector('time').getAttribute('datetime'))
                };
                if (entry.type == "IP 주소 차단") entry.type = "blockIP";
                else if (entry.type == "IP 주소 차단 해제") entry.type = "unblockIP"
                else if (entry.type == "사용자 차단") entry.type = "blockUser";
                else if (entry.type == "사용자 차단 해제") entry.type = "unblockUser";
                result.push(entry);
            }
            callback(result);
        }
    })
}

// sendUploadReq
namuapi.uploadImage = function (data, callback) {
    var query = new FormData();
    query.append('file', data.file);
    query.append('document', data.fn);
    query.append('text', data.docuText);
    query.append('log', data.log);
    query.append('baserev', 0);
    query.append('identifier', data.identifier); // (ENV.IsLoggedIn ? "m" : "i") + ":" + ENV.UserName
    if (data.recaptchaKey !== null)
        query.append('g-recaptcha-response', data.recaptchaKey);
    namuapi.theseedRequest({
        method: 'POST',
        url: 'https://' + location.host + '/Upload',
        headers: {
            "Referer": 'https://' + location.host + '/Upload'
        },
        data: query,
        onload: function (res) {
            var parser = new DOMParser();
            if (parser.parseFromString(res.responseText, "text/html").querySelector("p.wiki-edit-date") != null) {
                callback(null, fn);
            } else if (res.responseText.indexOf('CAPTCHA를 체크하지 않은 경우입니다.') != -1) {
                callback("recaptcha_required");
            } else {
                callback("html_error", res.responseText);
            }
        }
    });
}

window.namuapi = namuapi;