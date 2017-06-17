'use strict';

const _ = require("lodash");

class Shim {
  constructor(config) {
    this.config = config.plugins.shim || {};
  }

  compile(file) {
    let shimmed = this.config.shimmed || {};
    let path = file.path;
    if (shimmed.hasOwnProperty(path)) {
      let definition = shimmed[path];

      let imports = definition["imports"] || [];
      let exports = definition["exports"] || [];

      file.data = `
require.define({${path}: function(exports, require, module) {
  ${_.join(imports, ";\n")}

  ${file.data}

  ${_.join(exports, ";\n")}
}});\n\n`;
    }
  }
}

Shim.prototype.brunchPlugin = true;
Shim.prototype.extension = 'js';
Shim.prototype.pattern = /\.js$/;

module.exports = Shim;
