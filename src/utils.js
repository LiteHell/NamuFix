module.insertCSS = function(url) {
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function (res) {
          GM_addStyle(res.responseText);
        }
      });
};
module.encodeHTMLComponent = function(text) {
    var result = text;
    // http://www.w3schools.com/php/func_string_htmlspecialchars.asp 참고함.
    result = result.replace(/&/gmi, "&amp;");
    result = result.replace(/</gmi, "&lt;");
    result = result.replace(/>/gmi, "&gt;");
    result = result.replace(/'/gmi, "&#039;");
    result = result.replace(/"/gmi, "&quot;");
    return result;
};