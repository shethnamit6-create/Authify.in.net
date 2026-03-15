const { connectDb } = require('../src/config/db');
const { env } = require('../src/config/env');
const app = require('../src/app');

let connectionPromise;

module.exports = async (req, res) => {
  if (!connectionPromise) {
    connectionPromise = connectDb(env.MONGO_URI);
  }
  await connectionPromise;
  return app(req, res);
};
