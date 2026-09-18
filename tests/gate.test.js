const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateGate, parseReceipt } = require('../src/gate');

const approve = `---
subject: assforge/agent-sandbox
sha: abc123
author_engine: grok
reviewer_engine: deepseek
verdict: APPROVE
---

Looks good.
`;

test('gate passes when a different engine approves the sha', () => {
  const fields = parseReceipt(approve);
  const result = evaluateGate(fields, 'abc123');
  assert.equal(result.ok, true);
});

test('gate rejects same-engine self-approve', () => {
  const fields = parseReceipt(approve.replace('deepseek', 'grok'));
  const result = evaluateGate(fields);
  assert.equal(result.ok, false);
  assert.match(result.reason, /differ/);
});

test('gate rejects non-APPROVE verdict', () => {
  const fields = parseReceipt(approve.replace('APPROVE', 'REQUEST_CHANGES'));
  const result = evaluateGate(fields);
  assert.equal(result.ok, false);
  assert.match(result.reason, /REQUEST_CHANGES/);
});

test('gate rejects sha mismatch', () => {
  const fields = parseReceipt(approve);
  const result = evaluateGate(fields, 'fff');
  assert.equal(result.ok, false);
  assert.match(result.reason, /does not match/);
});
