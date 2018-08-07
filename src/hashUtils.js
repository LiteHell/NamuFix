function hashUtils() {
    var hashDictionary512 = {};
    var hashDictionary1 = {};
    var hashDictionary256 = {};
    var ipDictionary = {};

    this.SHA512 = (text) => {
        if (typeof hashDictionary512[text] === 'undefined') {
            var shaObj = new jsSHA("SHA-512", "TEXT");
            shaObj.update(text);
            hashDictionary512[text] = shaObj.getHash("HEX");
        }
        return hashDictionary512[text];
    }

    this.SHA1 = (text) => {
        if (typeof hashDictionary1[text] === 'undefined') {
            var shaObj = new jsSHA("SHA-1", "TEXT");
            shaObj.update(text);
            hashDictionary1[text] = shaObj.getHash("HEX");
        }
        return hashDictionary1[text];
    }

    this.SHA256 = (text) => {
        if (typeof hashDictionary256[text] === 'undefined') {
            var shaObj = new jsSHA("SHA-256", "TEXT");
            shaObj.update(text);
            hashDictionary256[text] = shaObj.getHash("HEX");
        }
        return hashDictionary256[text];
    }
}