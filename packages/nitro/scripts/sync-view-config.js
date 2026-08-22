const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const generated = path.join(
  packageRoot,
  'nitrogen/generated/shared/json/LottieViewConfig.json',
);
const vendored = path.join(packageRoot, 'src/views/LottieViewConfig.json');

const checkOnly = process.argv.includes('--check');

function rel(p) {
  return path.relative(packageRoot, p);
}

function main() {
  if (!fs.existsSync(generated)) {
    console.error(
      `sync-view-config: ${rel(generated)} is missing. Run \`yarn codegen\`.`,
    );
    process.exit(1);
  }

  const source = fs.readFileSync(generated, 'utf8');

  if (checkOnly) {
    const current = fs.existsSync(vendored)
      ? fs.readFileSync(vendored, 'utf8')
      : null;
    if (current !== source) {
      console.error(
        `sync-view-config: ${rel(vendored)} is out of date.\n\n` +
          `  Run \`yarn codegen\` and commit the result.`,
      );
      process.exit(1);
    }
    console.log(
      `sync-view-config: ok — ${rel(vendored)} matches nitrogen output`,
    );
    return;
  }

  fs.mkdirSync(path.dirname(vendored), {recursive: true});
  fs.writeFileSync(vendored, source);
  console.log(`sync-view-config: wrote ${rel(vendored)}`);
}

main();
