var FAT_ARROW = /^\s*\(?((\w+)(\s*,\s*\w+)*)?\)?\s*=>\s*(.+)\s*$/;

module.exports = function fatArrow(str) {
  if (typeof str === 'string') {
    var match = str.match(FAT_ARROW);
    if (match) {
      var body = match[4];
      if (body.charAt(0) === '{') {
        if (body.substr(-1) !== '}') {
          throw new Error('invalid fat arrow body: "' + body + '"');
        }
        // strip the outer curly braces
        body = body.substr(1, body.length - 2);
      }
      return new Function(match[1], 'return (' + body + ');');
    }
  }
};
