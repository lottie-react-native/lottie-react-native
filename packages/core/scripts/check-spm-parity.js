const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(packageRoot, 'Package.swift');
const podspecPath = path.join(packageRoot, 'lottie-react-native.podspec');
const iosRoot = path.join(packageRoot, 'ios');

const COMPILED = new Set(['.swift', '.m', '.mm']);
const MANIFEST_ONLY_DIRS = new Set(['LottieReactNative.xcodeproj']);

function fail(lines) {
  console.error('spm-parity: Package.swift and the podspec disagree.\n');
  for (const line of lines) {
    console.error(`  ${line}`);
  }
  console.error(
    '\nUpdate packages/core/Package.swift so both manifests describe the same build.',
  );
  process.exit(1);
}

function walk(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (MANIFEST_ONLY_DIRS.has(entry.name)) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs, rel));
    } else if (COMPILED.has(path.extname(entry.name))) {
      out.push(rel);
    }
  }
  return out;
}

function manifestSources(manifest) {
  const found = new Set();
  const blocks = manifest.matchAll(/sources:\s*\[([^\]]*)\]/g);
  for (const block of blocks) {
    for (const entry of block[1].matchAll(/"([^"]+)"/g)) {
      found.add(entry[1]);
    }
  }
  return found;
}

function podspecLottieVersion(podspec) {
  const match = podspec.match(/s\.dependency\s+['"]lottie-ios['"]\s*,\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function manifestLottieVersion(manifest) {
  const match = manifest.match(/lottie-spm\.git["']\s*,\s*exact:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

function main() {
  for (const required of [manifestPath, podspecPath]) {
    if (!fs.existsSync(required)) {
      fail([`missing ${path.relative(packageRoot, required)}`]);
    }
  }

  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const podspec = fs.readFileSync(podspecPath, 'utf8');
  const problems = [];

  const onDisk = walk(iosRoot).sort();
  const declared = manifestSources(manifest);

  for (const file of onDisk) {
    if (!declared.has(file)) {
      problems.push(`ios/${file} is compiled by the podspec but absent from Package.swift`);
    }
  }
  for (const file of [...declared].sort()) {
    if (!fs.existsSync(path.join(iosRoot, file))) {
      problems.push(`Package.swift lists ios/${file}, which does not exist`);
    }
  }

  const podLottie = podspecLottieVersion(podspec);
  const spmLottie = manifestLottieVersion(manifest);
  if (podLottie == null) {
    problems.push('could not read the lottie-ios version from the podspec');
  } else if (spmLottie == null) {
    problems.push('could not read the lottie-spm version from Package.swift');
  } else if (podLottie !== spmLottie) {
    problems.push(`lottie-ios is ${podLottie} in the podspec and ${spmLottie} in Package.swift`);
  }

  const files = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
  ).files;
  if (!files.includes('Package.swift')) {
    problems.push('package.json "files" does not include Package.swift, so it would not be published');
  }

  if (problems.length > 0) {
    fail(problems);
  }

  console.log(
    `spm-parity: ok — ${onDisk.length} compiled sources, lottie-ios ${podLottie}`,
  );
}

main();
