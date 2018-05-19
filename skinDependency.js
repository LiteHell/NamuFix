let skinDependencies = {
    "senkawa": {
        addArticleButtons: (text, onclick) => {
            var aTag = document.createElement("a");
            aTag.className = "btn btn-secondary";
            aTag.setAttribute("role", "button");
            aTag.innerHTML = text;
            aTag.href = "#";
            aTag.addEventListener('click', (evt) => {
              evt.preventDefault();
              onclick(evt);
            });
            var buttonGroup = document.querySelector('.wiki-article-menu > div.btn-group');
            buttonGroup.insertBefore(aTag, buttonGroup.firstChild);
        },
        get isLoggedIn() {
            return document.querySelector('img.user-img') !== null;
        },
        get username() {
            return document.querySelector('div.user-info > div.user-info > div:first-child').textContent.trim();
        },
        get docTitle() {
            if (document.querySelector("body.senkawa h1.title > a"))
                return document.querySelector("body.senkawa h1.title > a").textContent.trim();
            if (document.querySelector("body.senkawa h1.title"))
                return document.querySelector("body.senkawa h1.title").textContent.trim();
            if (/^\/[a-zA-Z_]+\/(.+)/.test(location.pathname))
                return decodeURIComponent(/^\/[a-zA-Z_]+\/(.+)/.exec(location.pathname)[1]).trim();
        },
        get topicTitle() {
            return document.querySelector('article > h2').innerHTML.trim();
        }
    },
    "liberty": {
        addArticleButtons: (text, onclick) => {
            var aTag = document.createElement("a");
            aTag.className = "btn btn-secondary";
            aTag.setAttribute("role", "button");
            aTag.innerHTML = text;
            aTag.href = "#";
            aTag.addEventListener('click', (evt) => {
              evt.preventDefault();
              onclick(evt);
            });
            var buttonGroup = document.querySelector('body.Liberty .liberty-content .content-tools .btn-group');
            buttonGroup.insertBefore(aTag, buttonGroup.firstChild);
        },
        get isLoggedIn() {
            return document.querySelector('body.Liberty img.profile-img') !== null;
        },
        get username() {
            return document.querySelector('body.Liberty .navbar-login .login-menu .dropdown-menu .dropdown-item:first-child').textContent.trim();
        },
        get docTitle() {

            if (location.pathname.toLowerCase().startsWith('/thread/'))
                return /^(.+) \(토론\)/.exec(document.querySelector('.liberty-content .liberty-content-header .title h1').textContent.trim())[1].trim();
            if (/^\/[a-zA-Z_]+\/(.+)/.test(location.pathname))
                return decodeURIComponent(/^\/[a-zA-Z_]+\/(.+)/.exec(location.pathname)[1]).trim();
            return document.querySelector('body.Liberty .liberty-content-header .title h1').textContent.trim();
        },
        get topicTitle() {
            return document.querySelector('body.Liberty .wiki-article h2.wiki-heading:first-child').innerHTML.trim();
        }
    },
    "buma": {

    },
    "vector": {

    }
}
let skinDepedency = null;
for(var i in skinDependencies) {
    if(document.className.includes(i)) {
        skinDepedency = skinDependencies[i]
        break;
    }
}