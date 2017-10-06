var cache = {};
module.exports = function (ip, cb) {
    if (cache[ip])
        return cb(cache[ip]);
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://ipinfo.io/{0}/json".format(ip),
        onload: function (res) {
            var resObj = JSON.parse(res.responseText);
            if (res.status === 200 || res.status === 304) {
                cache[ip] = resObj;
                cb(resObj);
            } else {
                cb(null);
            }
        }
    });
};