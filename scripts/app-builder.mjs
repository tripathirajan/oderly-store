import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, context } from 'esbuild';
import { clean } from './clean.mjs';
import { createBuilds } from '../config/esbuild/esbuild.config.mjs';
import { createRuntimeConfig } from '../config/runtime/factory.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function usage() {
  console.info(`Usage: node scripts/app-builder.mjs [options]

Options:
  --mode, --env <dev|staging|prod>  Build mode (default: NODE_ENV or dev)
  --target <all|server|cdn|metrics|client> Build target (default: all)
  --watch                   Rebuild on source changes
  --clean                   Remove generated output before building
  --no-clean                Keep existing output (default when watching)
  --help                    Show this help

Server target builds the app server. CDN and metrics are independent server targets.
Client target includes Node, modern-browser, legacy-browser, and stylesheet bundles.`);
}

function parseArgs() {
  const options = {
    mode: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    target: 'all',
    watch: false,
    clean: undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

    if (arg === '--watch' || arg === '-w') {
      options.watch = true;
      continue;
    }

    if (arg === '--clean') {
      options.clean = true;
      continue;
    }

    if (arg === '--no-clean') {
      options.clean = false;
      continue;
    }

    if (arg === '--mode' || arg === '--env' || arg === '-m') {
      if (!next) throw new Error(`Missing value for ${arg}.`);
      options.mode = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--mode=') || arg.startsWith('--env=')) {
      options.mode = arg.slice(arg.indexOf('=') + 1);
      continue;
    }

    if (arg === '--target' || arg === '-t') {
      if (!next) throw new Error(`Missing value for ${arg}.`);
      options.target = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--target=')) {
      options.target = arg.slice('--target='.length);
      continue;
    }

    if (arg === 'dev' || arg === 'staging' || arg === 'prod') {
      options.mode = arg;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!['dev', 'staging', 'prod'].includes(options.mode)) {
    throw new Error(`Invalid build mode "${options.mode}". Choose dev, staging, or prod.`);
  }
  if (!['all', 'server', 'cdn', 'metrics', 'client'].includes(options.target)) {
    throw new Error(
      `Invalid target "${options.target}". Choose all, server, cdn, metrics, or client.`,
    );
  }

  options.clean ??= !options.watch;
  return options;
}

async function main() {
  const options = parseArgs();
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 24) {
    throw new Error(
      `Oderly builds require Node.js 24 or newer. Current version: ${process.version}`,
    );
  }

  process.chdir(projectRoot);
  console.info(
    `app-builder | mode=${options.mode} target=${options.target} watch=${options.watch} clean=${options.clean} node=${process.version} os=${process.platform} ci=${Boolean(process.env.CI)}`,
  );

  if (options.clean) clean(options.target);
  const buildMode = options.mode === 'dev' ? 'dev' : 'prod';
  const environmentConfig = await import(`../config/esbuild/esbuild.${buildMode}.mjs`);
  const runtimeConfig = createRuntimeConfig(options.mode);
  const builds = createBuilds({
    ...options,
    projectRoot,
    environmentOptions: environmentConfig.buildOptions,
    serverConfiguration: {
      common: runtimeConfig.common,
      ...runtimeConfig.server,
      clientModule: runtimeConfig.clientModule,
    },
    clientModuleServerConfiguration: runtimeConfig.clientModule.server,
  });

  for (const configuration of builds) {
    await mkdir(dirname(configuration.outfile), { recursive: true });
  }

  if (options.watch) {
    const contexts = await Promise.all(builds.map((configuration) => context(configuration)));
    await Promise.all(contexts.map((buildContext) => buildContext.watch()));
    console.info('Watching build inputs. Press Ctrl+C to stop.');
    return;
  }

  await Promise.all(builds.map((configuration) => build(configuration)));
  console.info('Build completed successfully.');
}

main().catch((error) => {
  console.error(`app-builder failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
