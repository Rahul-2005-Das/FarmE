import 'dotenv/config';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 4000);
const { app, repository } = createApp();

try {
  await repository.init();
  const server = app.listen(port, () => {
    console.log(`FarmE API listening on http://localhost:${port}`);
  });
  const shutdown = async () => {
    server.close();
    await repository.close();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error('Unable to start API server', error);
  await repository.close();
  process.exitCode = 1;
}
