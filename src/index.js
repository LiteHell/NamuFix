const updater = require('./updater'),
      settings = new require('./settings'),
      {insertCSS, enocdeHTMLComponent} = require('utils');

if (location.hostname === 'no-ssl.namu.wiki')
    location.hostname = 'namu.wiki'

updater();

insertCSS("https://cdn.rawgit.com/LiteHell/NamuFix/0ea78119c377402a10bbdfc33365c5195ce7fccc/NamuFix.css");
insertCSS("https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/edad912e28eeacdc3fd8b6e6b7ac5cafc46d95b6/TooSimplePopupLib.css");
insertCSS("https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/diffview.css");

settings.init();