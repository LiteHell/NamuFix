// 비로그인 배려해서 메뉴를 새로 하나 생성하는 방식으로.
var nfNav = document.createElement("li");
nfNav.className = "nav-item dropdown";
nfNav.innerHTML = '<a class="nav-link dropdown-toggle dropdown-toggle-fix" herf="#" data-toggle="dropdown" aria-expanded="false"><span class="fa fa-wrench"></span><span class="hide-title">NamuFix</span></a><div class="dropdown-menu" role="menu"></div>';
var dropdownMenu = nfNav.querySelector('.dropdown-menu');

module.exports = function (text, onclick) {
  var menuItem = document.createElement("a");
  menuItem.className = "dropdown-item";
  menuItem.href = "#NothingToLink";
  menuItem.innerHTML = text;
  menuItem.addEventListener('click', onclick);
  dropdownMenu.appendChild(menuItem);
}