module.exports = function(){
    var ENV = {};
    ENV.IsSSL = /^https/.test(location.href);
    ENV.IsEditing = location.pathname.toLowerCase().indexOf('/edit/') == 0;
    ENV.Discussing =  location.pathname.toLowerCase().indexOf('/thread/') == 0;
    ENV.IsDocument =  location.pathname.toLowerCase().indexOf('/w/') == 0; //&& document.querySelector('p.wiki-edit-date');
    ENV.IsSettings =  location.pathname.toLowerCase().indexOf('/settings/') == 0;;
    ENV.IsUserContribsPage = /^\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.pathname);
    ENV.IsUploadPage = location.pathname.toLowerCase().indexOf('/upload/') == 0;
    ENV.IsDiff = location.pathname.toLowerCase().indexOf('/diff/') == 0;
    ENV.IsLoggedIn = document.querySelectorAll('img.user-img').length == 1;
    ENV.IsSearch = location.pathname.indexOf('/search/') == 0;
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
      ENV.topicNo = /^\/thread\/([^#]+)/.exec(location.pathname)[1];
      ENV.topicTitle = document.querySelector('article > h2').innerHTML;
    }
    if (ENV.IsDiff) {
      //ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
      ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
      ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
    }
    if (ENV.IsSearch) {
      ENV.SearchQuery = decodeURIComponent(location.pathname.substring(8));
    }
    if (nOu(ENV.section))
      ENV.section = -2;
    return ENV;
};