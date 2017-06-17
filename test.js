'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const Plugin = require('.');

chai.use(chaiAsPromised);

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
      path: "legacyThing/src/jquery.legacyThing.js",
      data: fileData
    };
    plugin = new Plugin({
      plugins: {
        shim: {
          shimmed: [{
            match: 'legacyThing/src/jquery.legacyThing.js',
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
          }]
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
`
window = {};
window.jQuery = require('jquery');

;(function ($) {

  function legacyThing() {

  }

  window.legacyThing = legacyThing;
  window.RateYo = RateYo;
  $.fn.rateYo = rateYo;

}(window.jQuery));

let legacyThing = window.legacyThing;
module.exports = {default: legacyThing};
`.replace(/\s/g, "");

    const data = plugin.compile(file).then(file => file.data.replace(/\s/g, ""));

    return expect(data).to.eventually.equal(shimmed);
  });

});
