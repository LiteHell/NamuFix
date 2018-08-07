function flagUtils(){

      // To bypass CSP
      var flagIconDictionary = {};

      this.getFlagIcon = (countryCode, cb) => {
        if (flagIconDictionary[countryCode])
          return cb(flagIconDictionary[countryCode]);
        GM.xmlHttpRequest({
          method: 'GET',
          url: `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.9.0/flags/4x3/${countryCode}.svg`,
          onload: function (res) {
            flagIconDictionary[countryCode] = "data:image/svg+xml;base64," + btoa(res.responseText);
            return cb(flagIconDictionary[countryCode]);
          }
        });
      }
}