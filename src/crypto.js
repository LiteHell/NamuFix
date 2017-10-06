var cache = {};

function hashClousre(hashAlgo) {
    return function(text){
        if(typeof cache[hashAlgo] === 'undefined') cache[hashAlgo] = {};
        if(typeof cache[hashAlgo][text] === 'undefined') {
            var shaObj = new jsSHA(hashAlgo, "TEXT");
            shaObj.update(text);
            cache[hashAlgo][text] = shaObj.getHash("HEX");
        }
        return cache[hashAlgo][text];
    };
}
module.sha512 = hashClousre("SHA-512");
module.sha256 = hashClosure("SHA-256");