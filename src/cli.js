const { resolve } = require('path');
const { defaultFamilyFile, inspectFamily } = require('./family');
const { renderBoard } = require('./board');
const { gateReceiptFile } = require('./gate');

function flag(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) return undefined;
  return args[index + 1];
}

function showHelp() {
  console.log(`cogent-release — unified cogent family release board

Usage:
  cogent-release board [--root DIR] [--json]
  cogent-release gate --receipt FILE [--sha SHA]
  cogent-release help

board   Scan family.json against a checkout root (default: parent of this
        package). Shows version, changesets, pending files, branch, dirt.
gate    AI self-merge gate. Same GitHub user may merge, but reviewer_engine
        must differ from author_engine and verdict must be APPROVE.
`);
}

function run(argv) {
  const args = argv.slice(2);
  const command = args[0] ?? 'board';
  if (command === 'help' || command === '-h' || command === '--help') {
    showHelp();
    return 0;
  }
  if (command === 'board') {
    const familyFile = resolve(flag(args, '--family') ?? defaultFamilyFile());
    const root = flag(args, '--root');
    const snapshot = inspectFamily(familyFile, root ? resolve(root) : undefined);
    if (args.includes('--json')) {
      console.log(JSON.stringify(snapshot, null, 2));
    } else {
      console.log(`family ${snapshot.family}  root ${snapshot.root}`);
      console.log(renderBoard(snapshot));
    }
    return 0;
  }
  if (command === 'gate') {
    const receipt = flag(args, '--receipt');
    if (!receipt) {
      console.error('gate requires --receipt FILE');
      return 2;
    }
    const result = gateReceiptFile(resolve(receipt), flag(args, '--sha'));
    console.log(result.reason);
    return result.ok ? 0 : 1;
  }
  console.error(`unknown command: ${command}`);
  showHelp();
  return 2;
}

module.exports = { run };
