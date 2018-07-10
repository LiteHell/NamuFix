let skinDependencies = {
    "senkawa": {
        addArticleButton: (text, onclick) => {
            var aTag = document.createElement("a");
            aTag.className = "btn btn-secondary";
            aTag.setAttribute("role", "button");
            aTag.innerHTML = text;
            aTag.href = "#";
            aTag.addEventListener('click', (evt) => {
                evt.preventDefault();
                onclick(evt);
            });
            var buttonGroup = document.querySelector('body.senkawa .wiki-article-menu > div.btn-group');
            buttonGroup.insertBefore(aTag, buttonGroup.firstChild);
        },
        addItemToMemberMenu: (text, onclick) => {
            let navbar = document.querySelector('nav.navbar ul.nav.navbar-nav');
            if (!navbar.querySelector('.nf-navbar-dropdown')) {
                let nfNavDropdown = document.createElement('li');
                nfNavDropdown.className = "nav-item dropdown nf-navbar-dropdown";
                nfNavDropdown.innerHTML = '<a class="nav-link dropdown-toggle" href="#" title="NamuFix" data-toggle="dropdown" role="button"><span class="icon ion-wrench"></span><span class="icon-title">NamuFix</span></a><div class="dropdown-menu right"></div>';
                navbar.appendChild(nfNavDropdown)
            }
            let nfNavDropdown = navbar.querySelector('.nf-navbar-dropdown .dropdown-menu');
            let menuItem = document.createElement('a');
            menuItem.className = "dropdown-item";
            menuItem.innerHTML = `<span class="icon ion-wrench"></span><span class="icon-title">${text}</span>`;
            menuItem.href = '#';
            menuItem.addEventListener('click', onclick);
            nfNavDropdown.appendChild(menuItem);
        },
        get IsLoggedIn() {
            return document.querySelector('img.profile-img, img.user-img') !== null;
        },
        get UserName() {
            return document.querySelector('body.Liberty .navbar-login .login-menu .dropdown-menu .dropdown-item:first-child, div.user-info > div.user-info > div:first-child').textContent.trim();
        }
    },
    "buma": {
        addArticleButton: (text, onclick) => {
            let menu = document.querySelector('#wiki-article-menu ul');
            let item = document.createElement("li");
            item.innerHTML = `<a href="#"><span class="icon"><i class="fas fa-wrench"></i></span><span class="wiki-article-menu-text">${text}</span></a>`;
            item.querySelector('a').addEventListener("click", onclick);
            menu.appendChild(item);
        },
        addItemToMemberMenu: (text, onclick) => {
            let menu = document.querySelector('.navbar-end .navbar-item.has-dropdown .navbar-dropdown');
            if (!menu.querySelector('.navbar-divider.nf-divider'))
                menu.appendChild((() => {
                    let i = document.createElement('div');
                    i.className = 'navbar-dropdown nf-divider';
                    return i;
                })());
            let menuItem = document.createElement("a");
            menuItem.className = "navbar-item";
            menuItem.href = "#";
            menuItem.innerHTML = `<span class="icon"><i class="fas fa-wrench"></i></span>${text}`;
            menuItem.appendChild('click', onclick);
            menu.appendChild(menuItem);
        },
        get IsLoggedIn() {
            return document.querySelectorAll('.navbar-end .navbar-item.has-dropdown .navbar-dropdown .navbar-item').length > 2; // 내가 생각해도 병신같은 발상
        },
        get UserName() {
            return document.querySelector('.navbar-end .navbar-item.has-dropdown a.navbar-link:first-child').textContent.trim();
        }
    },
    "liberty": {
        addArticleButton: (text, onclick) => {
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
        addItemToMemberMenu: (text, onclick) => {
            let navbar = document.querySelector('nav.navbar ul.nav.navbar-nav');
            if (!navbar.querySelector('.nf-navbar-dropdown')) {
                let nfNavDropdown = document.createElement('li');
                nfNavDropdown.className = "nav-item dropdown nf-navbar-dropdown";
                nfNavDropdown.innerHTML = '<a class="nav-link dropdown-toggle" href="#" title="NamuFix" data-toggle="dropdown" role="button"><span class="icon ion-wrench"></span><span class="icon-title">NamuFix</span></a><div class="dropdown-menu right"></div>';
                navbar.appendChild(nfNavDropdown)
            }
            let nfNavDropdown = navbar.querySelector('.nf-navbar-dropdown .dropdown-menu');
            let menuItem = document.createElement('a');
            menuItem.className = "dropdown-item";
            menuItem.innerHTML = `<span class="icon ion-wrench"></span><span class="icon-title">${text}</span>`;
            menuItem.href = '#';
            menuItem.addEventListener('click', onclick);
            nfNavDropdown.appendChild(menuItem);
        },
        get IsLoggedIn() {
            return document.querySelector('img.profile-img, img.user-img') !== null;
        },
        get UserName() {
            return document.querySelector('body.Liberty .navbar-login .login-menu .dropdown-menu .dropdown-item:first-child, div.user-info > div.user-info > div:first-child').textContent.trim();
        }

    }
}
function getSkinDependency(skinName) {
    return skinDependencies[skinName] | null;
}
function getSkinSupports() {
    return Object.keys(skinDependencies);
}