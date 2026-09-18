const { readFileSync } = require('fs');

const REQUIRED = ['subject', 'sha', 'author_engine', 'reviewer_engine', 'verdict'];

function parseReceipt(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) {
    throw new Error('receipt must start with YAML front matter between --- lines');
  }
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf(':');
    if (index < 1) continue;
    fields[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
  return fields;
}

function evaluateGate(fields, expectedSha) {
  const missing = REQUIRED.filter((key) => !fields[key]);
  if (missing.length > 0) {
    return { ok: false, reason: `missing fields: ${missing.join(', ')}` };
  }
  if (fields.author_engine === fields.reviewer_engine) {
    return { ok: false, reason: 'reviewer_engine must differ from author_engine; self-approve is not a skip' };
  }
  if (fields.verdict !== 'APPROVE') {
    return { ok: false, reason: `verdict is ${fields.verdict}, not APPROVE` };
  }
  if (expectedSha && fields.sha !== expectedSha) {
    return { ok: false, reason: `sha ${fields.sha} does not match ${expectedSha}` };
  }
  return { ok: true, reason: 'AI review gate passed' };
}

function gateReceiptFile(path, expectedSha) {
  return evaluateGate(parseReceipt(readFileSync(path, 'utf8')), expectedSha);
}

module.exports = { parseReceipt, evaluateGate, gateReceiptFile };
