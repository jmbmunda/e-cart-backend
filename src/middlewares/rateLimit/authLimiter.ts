import { createLimiter } from ".";

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: "Too many login attempts",
  },
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    error: "Too many signup attempts",
  },
});

export const forgotPasswordLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 1,
  message: {
    status: 429,
    error: "Too many forgot password requests",
  },
});

export const passwordResetLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 1,
  message: {
    status: 429,
    error: "Too many password reset requests",
  },
});
