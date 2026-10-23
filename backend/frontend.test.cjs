const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const script = fs.readFileSync(require('node:path').join(__dirname, '../frontend/script.js'), 'utf8');
function element() {
  return { hidden: false, value: '', children: [], listeners: {},
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; this.value = children[0]?.value || ''; },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    set innerHTML(value) { assert.equal(value, ''); this.children = []; }
  };
}
async function setup(fetch) {
  const elements = Object.fromEntries(['controls','search','category','loading','error','empty','grid','retry'].map(id => [id, element()]));
  elements.category.value = 'all';
  const context = vm.createContext({ document: { getElementById: id => elements[id], createElement: element },
    Option: function(text, value) { return { textContent: text, value }; }, fetch, AbortSignal, Intl, console: { error() {} } });
  vm.runInContext(script, context);
  await new Promise(resolve => setImmediate(resolve));
  return elements;
}
test('frontend renders literal text, filters, empty state and retry without duplicate categories', async () => {
  const items = [{ name: '<img onerror=alert(1)>', category: 'Audio', price: 12 }];
  const el = await setup(async () => ({ ok: true, json: async () => items }));
  assert.equal(el.grid.hidden, false);
  assert.equal(el.loading.hidden, true);
  assert.equal(el.grid.children[0].children[1].textContent, items[0].name);
  el.search.value = 'missing'; el.search.listeners.input();
  assert.equal(el.empty.hidden, false);
  assert.equal(el.grid.hidden, true);
  await el.retry.listeners.click();
  assert.equal(el.category.children.length, 2);
});
test('frontend catches network, HTTP and malformed payload failures and recovers', async () => {
  for (const response of [null, { ok: false, status: 500 }, { ok: true, json: async () => ({}) }]) {
    let fail = true;
    const el = await setup(async () => {
      if (!fail) return { ok: true, json: async () => [] };
      if (!response) throw Error('offline');
      return response;
    });
    assert.equal(el.error.hidden, false);
    assert.equal(el.controls.hidden, true);
    fail = false;
    await el.retry.listeners.click();
    assert.equal(el.error.hidden, true);
    assert.equal(el.empty.hidden, false);
  }
});
