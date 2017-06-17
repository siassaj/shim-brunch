'use strict';

const expect = require('chai').expect;
const Plugin = require('.');

describe('Plugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new Plugin({
      plugins: {}
    });
  });

  it('responds to #compile method', () => {
    expect(plugin).to.respondTo('compile');
  });
});
