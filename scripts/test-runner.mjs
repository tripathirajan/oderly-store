import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeConfig } from '../config/runtime/factory.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testConfig = resolve(projectRoot, 'config/tsconfig.json');
const testsDirectory = resolve(projectRoot, 'tests');
const testFiles = (await readdir(testsDirectory))
  .filter((file) => file.endsWith('.test.ts'))
  .map((file) => resolve(testsDirectory, file));
const runtimeConfig = createRuntimeConfig('dev', process.env);
const child = spawn(
  process.execPath,
  ['--import=tsx', '--test', ...testFiles, ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      ODERLY_SERVER_CONFIG: JSON.stringify({
        common: runtimeConfig.common,
        ...runtimeConfig.server,
        clientModule: runtimeConfig.clientModule,
      }),
      ODERLY_CLIENT_SERVER_CONFIG: JSON.stringify(runtimeConfig.clientModule.server),
      TSX_TSCONFIG_PATH: testConfig,
    },
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  console.error(`Test runner failed to start: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Test runner terminated by signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
