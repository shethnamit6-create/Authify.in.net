const app = require('./src/app');
const { connectDb } = require('./src/config/db');
const { env } = require('./src/config/env');

(async () => {
  await connectDb(env.MONGO_URI);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Authify backend listening on port ${env.PORT}`);
  });
})();
