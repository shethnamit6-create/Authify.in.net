const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDb } = require('../src/config/db');
const { env } = require('../src/config/env');
const Application = require('../src/models/Application');

(async () => {
  await connectDb(env.MONGO_URI);
  const targetOrigin = process.env.TARGET_ORIGIN || 'https://authify.in.net';
  const apps = await Application.find({});
  for (const app of apps) {
    const allowed = new Set([...(app.allowedOrigins || [])]);
    allowed.add(targetOrigin);
    app.allowedOrigins = Array.from(allowed);
    await app.save();
  }
  console.log(`Updated ${apps.length} application(s) with origin ${targetOrigin}`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
