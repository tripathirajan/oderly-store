import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { serverConfiguration } from './config';
import { createServer } from './create-server';

export function createCdnServer(staticDirectory = join(process.cwd(), 'build', 'static')) {
  const app = createServer({
    cors: serverConfiguration.common.cors,
    helmet: serverConfiguration.common.helmet,
  });

  app.register(fastifyStatic, {
    root: staticDirectory,
    prefix: '/assets/',
    decorateReply: false,
  });
  app.get('/health', async (_request, reply) => reply.send({ status: 'ok' }));

  return app;
}
