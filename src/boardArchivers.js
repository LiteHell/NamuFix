function BoardArchiver(nfVersion) {
    this.phpgongbu = (documentId) => {
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
