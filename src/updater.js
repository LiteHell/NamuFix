module.exports = function () {
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://api.github.com/repos/LiteHell/NamuFix/releases/latest",
        onload: function (res) {
            var obj = JSON.parse(res.responseText);
            var currentVersion = GM_info.script.version;
            var latestVersion = obj.tag_name;
            if (currentVersion != latestVersion) {
                var scriptUrl = 'https://github.com/LiteHell/NamuFix/raw/' + latestVersion + '/NamuFix.user.js';
                var win = TooSimplePopup();
                win.title('새버전 설치');
                win.content(function (element) {
                    // 변경 사항 : obj.body
                    element.innerHTML = '업데이트가 있습니다.<br><br>현재 사용중인 버전 : ' + currentVersion + '<br>' +
                        '현재 최신 버전 : ' + latestVersion + '<br><br>' +
                        latestVersion + '버전에서의 변경 사항<pre style="border-left: 6px solid green; padding: 10px; font-size: 13px; font-family: sans-family;" id="changeLog"></pre>' +
                        '<p><a href="' + scriptUrl + '" style="text-decoration: none;"><button type="button" style="display: block; margin: 0 auto;">최신 버전 설치</button></a></p>' +
                        '설치 후 새로고침을 해야 적용됩니다.<br>버그 신고 및 건의는 <a href="https://github.com/LiteHell/NamuFix/issues">이슈 트래커</a>에서 해주시면 감사하겠습니다.';
                    element.querySelector('#changeLog').innerHTML = obj.body;
                });
                win.button('닫기', win.close);
                win.button('새로고침', function () {
                    location.reload();
                });
            }
        }
    });
}