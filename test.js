'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiString = require('chai-string');
const expect = chai.expect;
const Plugin = require('.');

chai.use(chaiAsPromised);
chai.use(chaiString);

const fileData = `
;(function ($) {

  function legacyThing() {

  }

  window.legacyThing = legacyThing;
  window.RateYo = RateYo;
  $.fn.rateYo = rateYo;

}(window.jQuery));
`;

describe('Plugin', () => {
  let plugin, file;

  beforeEach(() => {
    file = {
      path: "node_modules/legacyThing/src/jquery.legacyThing.js",
      data: fileData
    };
    plugin = new Plugin({
      plugins: {
        shim: {
          shimmed: {
            match: 'node_modules/legacyThing/src/jquery.legacyThing.js',
            imports: [
              'window = {}',
              "window.jQuery = require('jquery')",
            ],
            exports: () =>  {
              return [
                'let legacyThing = window.legacyThing',
                'module.exports = {default: legacyThing}'
              ];
            }
          }
        }
      }
    });
  });

  it('responds to #compile method', () => {
    return expect(plugin).to.respondTo('compile');
  });

  it('imports and exports stuff as specfied', () => {
    return expect(plugin.compile(file)).to.be.a('promise');
  });

  it('#compile resolves a file', () => {
    const shimmed =
`require.define({node_modules/legacyThing/src/jquery.legacyThing.js: function(exports, require, module) {

;(function ($) {

  function legacyThing() {

  }

  window.legacyThing = legacyThing;
  window.RateYo = RateYo;
  $.fn.rateYo = rateYo;

}(window.jQuery));

}});`.replace(/\s/g, "");

    const data = plugin.compile(file).then(file => file.data.replace(/\s/g, ""));
    return expect(data).to.eventually.equal(shimmed);
  });

});
