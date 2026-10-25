import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const staleGeneratedPaths = [
  'dist',
  'client',
  'static/assets/browser.js',
  'static/assets/browser.js.map',
  'static/assets/legacy-browser.js',
  'static/assets/legacy-browser.js.map',
  'static/assets/oderly-browser.js',
  'static/assets/oderly-browser.js.map',
  'static/assets/oderly-legacy-browser.js',
  'static/assets/oderly-legacy-browser.js.map',
  'static/assets/oderly-node.js',
  'static/assets/oderly-node.js.map',
];

export function clean(target = 'all') {
  const targetPaths = {
    server: ['build/server'],
    cdn: ['build/server/cdn.js', 'build/server/cdn.js.map'],
    metrics: ['build/server/metrics.js', 'build/server/metrics.js.map'],
    client: ['build/static'],
  };
  const generatedPaths =
    target === 'all'
      ? ['build', ...staleGeneratedPaths]
      : [...(targetPaths[target] ?? targetPaths.client), ...staleGeneratedPaths];

  for (const path of generatedPaths) {
    rmSync(resolve(path), { force: true, recursive: true });
  }

  console.info(`Removed generated ${target} build output.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  clean();
}
