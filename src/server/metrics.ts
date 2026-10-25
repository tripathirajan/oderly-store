import { serverConfiguration } from './config';
import { createServer } from './create-server';

export function createMetricsServer() {
  const app = createServer({
    cors: serverConfiguration.common.cors,
    helmet: serverConfiguration.common.helmet,
  });

  app.get('/health', async (_request, reply) => reply.send({ status: 'ok' }));
  app.get('/metrics', async (_request, reply) => {
    const memoryUsage = process.memoryUsage();
    const metrics = [
      '# HELP process_uptime_seconds Process uptime in seconds.',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${process.uptime()}`,
      '# HELP process_resident_memory_bytes Resident memory size in bytes.',
      '# TYPE process_resident_memory_bytes gauge',
      `process_resident_memory_bytes ${memoryUsage.rss}`,
      '# HELP process_heap_used_bytes Process heap used in bytes.',
      '# TYPE process_heap_used_bytes gauge',
      `process_heap_used_bytes ${memoryUsage.heapUsed}`,
      '',
    ].join('\n');

    return reply.type('text/plain; version=0.0.4; charset=utf-8').send(metrics);
  });

  return app;
}
