import { createMetricsServer } from './metrics';
import { getServerAddress } from './config';

const app = createMetricsServer();
const { host, port } = getServerAddress('metrics');

app.listen({ port, host }).catch((error: unknown) => {
  console.error('Metrics server failed to start:', error);
  process.exit(1);
});
