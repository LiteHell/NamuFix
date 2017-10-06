module.exports = function(callback) {
  // create elements
  var pjaxButton = document.createElement("button");
  var scriptElement = document.createElement("script");

  // configure button
  pjaxButton.style.dispaly = "none";
  pjaxButton.id = "nfFuckingPJAX"
  pjaxButton.addEventListener("click", callback);

  // configure script
  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX").click();})';

  // add elements
  document.body.appendChild(pjaxButton);
  document.head.appendChild(scriptElement);
};