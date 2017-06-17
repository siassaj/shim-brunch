'use strict';

const _ = require('lodash');

const fetch = function(thing) {
  if (_.isFunction(thing)) {
    return thing();
  } else if (thing) {
    return thing;
  }
  return [];
};

class Shim {
  constructor(config) {
    this.config = config.plugins.shim || {};
  }

  compile(file) {
    const shimmed = this.config.shimmed || [];
    const path = file.path;
    console.log(file.path);
    const shimDefinition = _.find(shimmed, shim => path.match(shim.match));

    if (shimDefinition) {
      const imports = fetch(shimDefinition.imports);
      const exports = fetch(shimDefinition.exports);

      file.data = `
require.define({'${path}': function(exports, require, module) {
  ${_.join(imports, ';\n')}

  ${file.data}

  ${_.join(exports, ';\n')}
}});\n\n`;
    }

    return Promise.resolve(file);
  }
}

Shim.prototype.brunchPlugin = true;
Shim.prototype.extension = 'js';
Shim.prototype.pattern = /\.js$/;

module.exports = Shim;
