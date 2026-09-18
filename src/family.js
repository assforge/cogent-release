const { existsSync, readdirSync, readFileSync } = require('fs');
const { dirname, join, resolve } = require('path');
const { spawnSync } = require('child_process');

function loadFamily(familyFile) {
  const parsed = JSON.parse(readFileSync(familyFile, 'utf8'));
  if (!parsed || parsed.family !== 'cogent' || !Array.isArray(parsed.packages)) {
    throw new Error(`invalid family registry: ${familyFile}`);
  }
  return parsed;
}

function defaultFamilyFile() {
  return join(dirname(__dirname), 'family.json');
}

function defaultFamilyRoot(familyFile) {
  return resolve(dirname(familyFile), '..');
}

function pendingChangesets(dir) {
  const folder = join(dir, '.changeset');
  if (!existsSync(folder)) return 0;
  return readdirSync(folder).filter((name) => name.endsWith('.md') && name !== 'README.md').length;
}

function gitSnapshot(dir) {
  if (!existsSync(join(dir, '.git'))) {
    return { git: false, branch: '', dirty: false };
  }
  const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, encoding: 'utf8' });
  const porcelain = spawnSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
  return {
    git: true,
    branch: branch.status === 0 ? branch.stdout.trim() : '',
    dirty: porcelain.status === 0 && porcelain.stdout.trim().length > 0,
  };
}

function inspectPackage(familyRoot, pkg) {
  const dir = resolve(familyRoot, pkg.dir);
  const manifest = join(dir, 'package.json');
  if (!existsSync(manifest)) {
    return {
      id: pkg.id,
      name: pkg.name,
      repo: pkg.repo,
      dir: pkg.dir,
      present: false,
      version: '',
      changeset: false,
      pending: 0,
      git: false,
      branch: '',
      dirty: false,
    };
  }
  const version = JSON.parse(readFileSync(manifest, 'utf8')).version ?? '';
  const changeset = existsSync(join(dir, '.changeset', 'config.json'));
  const git = gitSnapshot(dir);
  return {
    id: pkg.id,
    name: pkg.name,
    repo: pkg.repo,
    dir: pkg.dir,
    present: true,
    version,
    changeset,
    pending: changeset ? pendingChangesets(dir) : 0,
    ...git,
  };
}

function inspectFamily(familyFile, familyRoot) {
  const family = loadFamily(familyFile);
  const root = familyRoot ?? defaultFamilyRoot(familyFile);
  return {
    family: family.family,
    root,
    packages: family.packages.map((pkg) => inspectPackage(root, pkg)),
  };
}

module.exports = {
  loadFamily,
  defaultFamilyFile,
  defaultFamilyRoot,
  inspectFamily,
  inspectPackage,
};
