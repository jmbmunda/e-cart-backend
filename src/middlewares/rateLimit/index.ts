import rateLimit from "express-rate-limit";
import { Options } from "express-rate-limit";

const GLOBAL_LIMIT_MINUTES = 15 * 60 * 1000; // 15
const GLOBAL_LIMIT_MAX = 1000;

type LimiterOptions = {} & Partial<Options>;

export const createLimiter = (options: LimiterOptions) => {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      const minutes = Math.ceil(options.windowMs / (60 * 1000));
      const unit = `minute${minutes > 1 ? "s" : ""}`;

      res.setHeader("Retry-After", minutes);
      res.status(options.statusCode || 429).json({
        status: options.statusCode || 429,
        error:
          typeof options.message === "string"
            ? `${options.message}. Try again in ${minutes} ${unit}`
            : {
                ...options.message,
                error: `${options.message.error}. Try again in ${minutes} ${unit}`,
              },
      });
    },
  });
};

export const globalLimiter = createLimiter({
  windowMs: GLOBAL_LIMIT_MINUTES,
  max: GLOBAL_LIMIT_MAX,
  message: "Too many requests",
});

export * from "./authLimiter";
