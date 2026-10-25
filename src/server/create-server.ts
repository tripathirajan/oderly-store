import Fastify from 'fastify';
import type { FastifyInstance, FastifyReply, FastifyServerOptions } from 'fastify';
import type { CorsConfiguration, HelmetConfiguration } from './config';

export interface CreateServerOptions {
  logger?: FastifyServerOptions['logger'];
  cors?: CorsConfiguration;
  helmet?: HelmetConfiguration;
}

export function createServer({
  logger = false,
  cors,
  helmet,
}: CreateServerOptions = {}): FastifyInstance {
  if (cors?.credentials && cors.origins.includes('*')) {
    throw new Error('CORS credentials cannot be enabled when allowing every origin.');
  }

  const app = Fastify({ logger });

  app.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'OPTIONS' || !cors) return;

    const origin = request.headers.origin;
    if (origin && isAllowedOrigin(cors, origin)) {
      setCorsHeaders(reply, cors, origin);
      reply.header('access-control-allow-methods', cors.methods.join(', '));
      const requestedHeaders = request.headers['access-control-request-headers'];
      reply.header(
        'access-control-allow-headers',
        requestedHeaders ?? cors.allowedHeaders.join(', '),
      );
    }

    return reply.code(204).send();
  });

  app.addHook('onSend', async (request, reply, payload) => {
    if (helmet) {
      reply
        .header('content-security-policy', helmet.contentSecurityPolicy)
        .header('referrer-policy', helmet.referrerPolicy)
        .header('cross-origin-resource-policy', helmet.crossOriginResourcePolicy)
        .header('x-content-type-options', 'nosniff')
        .header('x-frame-options', 'DENY');
    }

    const origin = request.headers.origin;
    if (cors && origin && isAllowedOrigin(cors, origin)) {
      setCorsHeaders(reply, cors, origin);
    }

    return payload;
  });

  return app;
}

function isAllowedOrigin(cors: CorsConfiguration, origin: string): boolean {
  return cors.origins.includes('*') || cors.origins.includes(origin);
}

function setCorsHeaders(reply: FastifyReply, cors: CorsConfiguration, origin: string): void {
  reply
    .header('access-control-allow-origin', cors.origins.includes('*') ? '*' : origin)
    .header('vary', 'Origin');

  if (cors.credentials) {
    reply.header('access-control-allow-credentials', 'true');
  }
}
