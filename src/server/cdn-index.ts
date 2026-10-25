import { createCdnServer } from './cdn';
import { getServerAddress } from './config';

const app = createCdnServer();
const { host, port } = getServerAddress('cdn');

app.listen({ port, host }).catch((error: unknown) => {
  console.error('CDN server failed to start:', error);
  process.exit(1);
});
