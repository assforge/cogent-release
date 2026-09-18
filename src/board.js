function pad(value, width) {
  const text = String(value ?? '');
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

function renderBoard(snapshot) {
  const header = [
    pad('id', 10),
    pad('package', 28),
    pad('ver', 8),
    pad('cs', 3),
    pad('pend', 4),
    pad('branch', 18),
    pad('tree', 8),
  ].join(' ');
  const lines = [header, '-'.repeat(Math.min(header.length, 100))];
  for (const pkg of snapshot.packages) {
    const tree = !pkg.present ? 'missing' : pkg.dirty ? 'dirty' : 'clean';
    lines.push(
      [
        pad(pkg.id, 10),
        pad(pkg.name, 28),
        pad(pkg.present ? pkg.version : '-', 8),
        pad(pkg.changeset ? 'yes' : 'no', 3),
        pad(pkg.present ? String(pkg.pending) : '-', 4),
        pad(pkg.branch || '-', 18),
        pad(tree, 8),
      ].join(' '),
    );
  }
  return lines.join('\n');
}

module.exports = { renderBoard };
