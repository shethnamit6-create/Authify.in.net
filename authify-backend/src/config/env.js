const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_KID: z.string().default('default-kid'),
  RP_NAME: z.string().default('Authify'),
  RP_ID: z.string().min(1),
  CHALLENGE_TTL_SECONDS: z.coerce.number().default(300),
  DEFAULT_JWT_EXPIRY: z.coerce.number().default(3600),
  ADMIN_SECRET: z.string().min(1),
  NODE_ENV: z.string().default('development')
});

const env = envSchema.parse(process.env);

module.exports = { env };
