
var nfMenuDivider = document.createElement("div");
(function () {
  nfMenuDivider.className = "dropdown-divider";
  var secondDivider = document.querySelectorAll('.dropdown-divider')[1];
  secondDivider.parentNode.insertBefore(nfMenuDivider, secondDivider);
})();

module.exports = function (text, onclick) {
  var menuItem = document.createElement("a");
  menuItem.className = "dropdown-item";
  menuItem.href = "#NothingToLink";
  menuItem.innerHTML = text;
  menuItem.addEventListener('click', onclick);
  nfMenuDivider.parentNode.insertBefore(menuItem, nfMenuDivider.nextSibling);
}