const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./server');
const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');

test('HTTP API: catalog, filters, validation, CORS, 404 and storage failures', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = route => fetch(base + route);
  try {
    const response = await get('/api/items');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    const items = await response.json();
    assert.equal(items.length, 12);
    assert.equal((await (await get('/api/items?category=audio&search=pulse')).json()).length, 2);
    assert.deepEqual(await (await get('/api/items?search=nonexistent')).json(), []);
    for (const query of ['search=a&search=b', 'category[x]=audio']) {
      assert.equal((await get('/api/items?' + query)).status, 400);
    }
    assert.equal((await get('/missing')).status, 404);
    assert.equal((await (await get('/')).json()).status, 'ok');
    // Restore the teaching catalog even when an assertion fails.
    const file = path.join(__dirname, 'data/items.json');
    const original = await readFile(file, 'utf8');
    try {
      for (const invalid of ['{broken', '{}', '[{"id":1}]']) {
        await writeFile(file, invalid);
        const failed = await get('/api/items');
        assert.equal(failed.status, 500);
        assert.deepEqual(await failed.json(), { error: 'Internal server error' });
      }
    } finally { await writeFile(file, original); }
  } finally { await new Promise(resolve => server.close(resolve)); }
});

