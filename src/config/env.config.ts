import z from "zod";

const envShema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3005),
  API_VERSION: z.string().default("v1"),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default("1h"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  OTP_DURATION_MS: z.coerce.number().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(10000),
  NODE_MAILER_USER: z.string(),
  NODE_MAILER_PASS: z.string(),
  NODE_MAILER_EMAIL_FROM: z.email(),
  BASE_URL: z.string(),
  CORS_ORIGIN: z.string().optional(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const parseEnv = () => {
  try {
    return envShema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
  }
};

const env = parseEnv();

export const config = {
  app: {
    node_env: env?.NODE_ENV,
    port: env?.PORT,
    api_version: env?.API_VERSION,
    cors_origin: env?.CORS_ORIGIN,
  },
  db: {
    user: env?.DB_USER,
    host: env?.DB_HOST,
    name: env?.DB_NAME,
    password: env?.DB_PASSWORD,
    port: env?.DB_PORT,
    url: env?.DATABASE_URL,
  },
  token: {
    secret: env?.JWT_SECRET,
    access_expiry: env?.ACCESS_TOKEN_EXPIRY,
    refresh_expiry: env?.REFRESH_TOKEN_EXPIRY,
  },
  rate_limit: {
    window_ms: env?.RATE_LIMIT_WINDOW_MS,
    max_requests: env?.RATE_LIMIT_MAX_REQUESTS,
  },
  mailer: {
    base_url: env?.BASE_URL,
    user: env?.NODE_MAILER_USER,
    pass: env?.NODE_MAILER_PASS,
    email_from: env?.NODE_MAILER_EMAIL_FROM,
  },
  otp: {
    duration_ms: env?.OTP_DURATION_MS,
  },
  redis: {
    host: env?.REDIS_HOST,
    port: env?.REDIS_PORT,
  },
};
