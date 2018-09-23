function BoardArchiver(nfVersion) { // GM.info.script.version
    this.phpgongbu = (documentId) => {
        /*
        GM.openInTab(res.finalUrl);
        archiveLink.textContent = "아카이브됨";
        archiveLink.href = res.finalUrl;
        */
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'POST',
                url: 'https://phpgongbu.ga/archive/',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": `Mozilla/5.0 (compatible; NamuFix/${nfVersion})`
                },
                data: `board_num=${documentId}`,
                onload: (res) => {
                    resolve(res.finalUrl);
                },
                onerror: reject
            });
        });
    }
    this.namuwikiml = (documentId) => {
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'POST',
                url: 'https://namuwiki.ml/archive/',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": `Mozilla/5.0 (compatible; NamuFix/${nfVersion})`
                },
                data: `archive_type=board&document_srl=${documentId}`,
                onload: (res) => {
                    resolve(res.finalUrl);
                },
                onerror: reject
            });
        });
    }
}