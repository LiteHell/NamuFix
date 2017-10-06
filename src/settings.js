function SET() {
    var discards = ['save', 'load', 'init'];
    this.save = function () {
        for (var i in this) {
            if (discards.indexOf(i) != -1) continue;
            GM_setValue('SET_' + i, this[i]);
        }
    };
    this.load = function () {
        var sets = GM_listValues();
        for (var i = 0; i < sets.length; i++) {
            var now = sets[i];
            if (now.indexOf('SET_') != 0) continue;
            if (discards.indexOf(now) != -1) continue;
            this[now.substring(4)] = GM_getValue(now);
        }
    };
    this.delete = function (key) {
        if (discards.indexOf(key) != -1) return;
        GM_deleteValue(key);
        delete this[key];
    };
    this.init = function () {
        if (!SET.tempsaves)
            SET.tempsaves = {};
        if (!SET.recentlyUsedTemplates)
            SET.recentlyUsedTemplates = [];
        if (!SET.imgurDeletionLinks)
            SET.imgurDeletionLinks = [];
        if (!SET.discussIdenti)
            SET.discussIdenti = 'icon'; // icon, headBg, none
        if (!SET.discussIdentiLightness)
            SET.discussIdentiLightness = 0.7;
        if (!SET.discussIdentiSaturation)
            SET.discussIdentiSaturation = 0.5;
        if (!SET.favorites)
            SET.favorites = [];
        if (!SET.customIdenticons)
            SET.customIdenticons = {};
        if (!SET.hideDeletedWhenDiscussing)
            SET.hideDeletedWhenDiscussing = 0;
        else if (typeof SET.hideDeletedWhenDiscussing !== "Number")
            SET.hideDeletedWhenDiscussing = Number(SET.hideDeletedWhenDiscussing);
        if (!SET.discussAnchorPreviewType)
            SET.discussAnchorPreviewType = 1; // 0 : None, 1 : mouseover, 2 : quote
        else
            SET.discussAnchorPreviewType = Number(SET.discussAnchorPreviewType);
        if (!SET.removeNFQuotesInAnchorPreview)
            SET.removeNFQuotesInAnchorPreview = false;
        if (!SET.lookupIPonDiscuss)
            SET.lookupIPonDiscuss = true;
        if (!SET.ignoreNonSenkawaWarning)
            SET.ignoreNonSenkawaWarning = false;
        if (!SET.loadUnvisibleReses)
            SET.loadUnvisibleReses = false;
        this.save();
    };
};