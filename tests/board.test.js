const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdirSync, mkdtempSync, writeFileSync, rmSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');
const { inspectFamily } = require('../src/family');
const { renderBoard } = require('../src/board');

test('board reports missing, changeset, and pending files from a fixture root', () => {
  const root = mkdtempSync(join(tmpdir(), 'cogent-release-'));
  test.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'live', '.changeset'), { recursive: true });
  writeFileSync(join(root, 'live', 'package.json'), JSON.stringify({ name: '@assforge/live', version: '1.2.3' }));
  writeFileSync(join(root, 'live', '.changeset', 'config.json'), '{}');
  writeFileSync(join(root, 'live', '.changeset', 'README.md'), 'x');
  writeFileSync(join(root, 'live', '.changeset', 'one.md'), '---\n---\n');
  const familyFile = join(root, 'family.json');
  writeFileSync(
    familyFile,
    JSON.stringify({
      family: 'cogent',
      packages: [
        { id: 'live', name: '@assforge/live', repo: 'assforge/live', dir: 'live' },
        { id: 'gone', name: '@assforge/gone', repo: 'assforge/gone', dir: 'gone' },
      ],
    }),
  );
  const snapshot = inspectFamily(familyFile, root);
  assert.equal(snapshot.packages[0].present, true);
  assert.equal(snapshot.packages[0].version, '1.2.3');
  assert.equal(snapshot.packages[0].changeset, true);
  assert.equal(snapshot.packages[0].pending, 1);
  assert.equal(snapshot.packages[1].present, false);
  const table = renderBoard(snapshot);
  assert.match(table, /live/);
  assert.match(table, /missing/);
});
