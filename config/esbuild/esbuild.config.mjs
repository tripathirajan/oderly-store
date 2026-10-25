export function createBuilds({
  target,
  projectRoot,
  environmentOptions,
  serverConfiguration,
  clientConfiguration,
}) {
  const common = {
    bundle: true,
    logLevel: 'info',
    ...environmentOptions,
  };
  const serverBuild = {
    ...common,
    define: {
      ...common.define,
      'process.env.ODERLY_SERVER_CONFIG': JSON.stringify(JSON.stringify(serverConfiguration)),
    },
  };
  const clientBuild = {
    ...common,
    define: {
      ...common.define,
      'process.env.ODERLY_CLIENT_CONFIG': JSON.stringify(JSON.stringify(clientConfiguration)),
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
        ...clientBuild,
        entryPoints: ['src/client/index.tsx'],
        outfile: 'build/static/oderly-browser.js',
        platform: 'browser',
        target: 'es2020',
        format: 'iife',
      },
      {
        ...clientBuild,
        entryPoints: ['src/client/index.tsx'],
        outfile: 'build/static/oderly-legacy-browser.js',
        platform: 'browser',
        target: 'es2015',
        format: 'iife',
      },
      {
        ...clientBuild,
        entryPoints: ['src/client/index.tsx'],
        outfile: 'build/static/oderly-node.js',
        platform: 'node',
        target: 'node24',
        format: 'cjs',
        packages: 'external',
      },
      {
        ...clientBuild,
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
