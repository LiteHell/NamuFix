function NFStorage() {
  function jsonParsable(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (err) {
      return false;
    }
  }
  var discards = ['save', 'load', 'delete', 'export', 'import'];
  this.save = async function () {
    for (var i in this) {
      if (discards.indexOf(i) != -1) continue;
      await GM.setValue('SET_' + i, JSON.stringify(this[i]));
    }
  };
  this.load = async function () {
    var sets = await GM.listValues();
    for (var i = 0; i < sets.length; i++) {
      var now = sets[i];
      if (now.indexOf('SET_') != 0) continue;
      if (discards.indexOf(now.substring(4)) != -1) continue;
      let sval = await GM.getValue(now);
      this[now.substring(4)] = jsonParsable(sval) ? JSON.parse(sval) : sval;
    }
  };
  this.delete = async function (key) {
    if (discards.indexOf(key) != -1) return;
    await GM.deleteValue('SET_' + key);
    delete this[key];
  };
  this.export = async function (excludes) {
    let sets = await GM.listValues();
    let result = {};
    for (let i of sets) {
      if (i.indexOf('SET_') != 0) continue;
      let setname = i.substring(4)
      if (discards.includes(setname) || excludes.includes(setname)) continue;
      result[setname] = await GM.getValue(i);
    }
    return result;
  };
  this.import = async function (data) {
    for (let i in data) {
      await GM.setValue('SET_' + i, data[i]);
    }
  }
}