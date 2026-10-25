import { createAppServer } from './app';
import { getServerAddress } from './config';

const app = createAppServer();
const { host, port } = getServerAddress('app');

app.listen({ port, host }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
