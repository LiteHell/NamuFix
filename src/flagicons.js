module.exports = function(countryCode) {
    return require(`../flags/${countryCode.toLower()}.svg`);
}