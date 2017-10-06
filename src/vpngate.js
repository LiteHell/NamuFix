var _vpngateList = [],
    _vpngateCrawlledAt = -1;

module.exports = function (callback) {
    if (_vpngateCrawlledAt == -1 || Date.now() - _vpngateCrawlledAt > 1000 * 60 * 3) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://www.vpngate.net/api/iphone/",
            onload: function (res) {
                var lines = res.responseText.split('\n');
                var result = [];
                for (var i = 0; i < lines.length; i++) {
                    if (!/^[\*#]/.test(lines[i]))
                        result.push(lines[i].split(',')[1]);
                }
                _vpngateList = result;
                _vpngateCrawlledAt = Date.now();
                callback(result);
            }
        })
    } else {
        console.log('returned cached vpngate ip list');
        callback(_vpngateList);
    }
}