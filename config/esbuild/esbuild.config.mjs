export function createBuilds({
  target,
  projectRoot,
  environmentOptions,
  serverConfiguration,
  clientModuleServerConfiguration,
}) {
  const common = {
    bundle: true,
    logLevel: 'info',
    jsx: 'automatic',
    ...environmentOptions,
  };
  const serverBuild = {
    ...common,
    define: {
      ...common.define,
      'process.env.ODERLY_SERVER_CONFIG': JSON.stringify(JSON.stringify(serverConfiguration)),
      'process.env.ODERLY_CLIENT_SERVER_CONFIG': JSON.stringify(
        JSON.stringify(clientModuleServerConfiguration),
      ),
    },
  };
  const builds = [];

  if (target === 'all' || target === 'server') {
    builds.push({
      ...serverBuild,
      entryPoints: ['src/server/index.tsx'],
      outfile: 'build/server/index.js',
      platform: 'node',
      target: 'node24',
      format: 'cjs',
      packages: 'external',
    });
  }

  if (target === 'all' || target === 'cdn') {
    builds.push({
      ...serverBuild,
      entryPoints: ['src/server/cdn-index.ts'],
      outfile: 'build/server/cdn.js',
      platform: 'node',
      target: 'node24',
      format: 'cjs',
      packages: 'external',
    });
  }

  if (target === 'all' || target === 'metrics') {
    builds.push({
      ...serverBuild,
      entryPoints: ['src/server/metrics-index.ts'],
      outfile: 'build/server/metrics.js',
      platform: 'node',
      target: 'node24',
      format: 'cjs',
      packages: 'external',
    });
  }

  if (target === 'all' || target === 'client') {
    builds.push(
      {
        ...common,
        entryPoints: ['src/client/index.tsx'],
        outfile: 'build/static/oderly-browser.js',
        platform: 'browser',
        target: 'es2020',
        format: 'iife',
      },
      {
        ...common,
        entryPoints: ['src/client/index.tsx'],
        outfile: 'build/static/oderly-legacy-browser.js',
        platform: 'browser',
        target: 'es2015',
        format: 'iife',
      },
      {
        ...common,
        define: {
          ...common.define,
          'process.env.ODERLY_CLIENT_SERVER_CONFIG': JSON.stringify(
            JSON.stringify(clientModuleServerConfiguration),
          ),
        },
        entryPoints: ['src/client/node.ts'],
        outfile: 'build/static/oderly-node.js',
        platform: 'node',
        target: 'node24',
        format: 'cjs',
        packages: 'external',
      },
      {
        ...common,
        entryPoints: ['static/assets/styles.css'],
        outfile: 'build/static/styles.css',
        platform: 'browser',
        target: 'es2020',
      },
    );
  }

  return builds.map((configuration) => ({
    ...configuration,
    absWorkingDir: projectRoot,
  }));
}
