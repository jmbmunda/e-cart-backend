import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const generateJwtToken = (id: string, expiresIn: string = "1h") => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn });
};

export const verifyJwtToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id?: string };
    return { isValid: true, expired: false, decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, expired: true, decoded: null };
    } else {
      return { isValid: false, expired: false, decoded: null };
    }
  }
};

export const isPasswordValid = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string, saltLength: number = 10) => {
  const salt = await bcrypt.genSalt(saltLength);
  const hashedPassword = await bcrypt.hash(password.toString(), salt);
  return hashedPassword;
};

export const emailPasswordReset = async (
  email: string,
  token: string,
  emailConfig?: {
    service?: string;
    from?: string;
    subject?: string;
    text?: string;
  }
) => {
  const transporter = nodemailer.createTransport({
    service: emailConfig?.service ?? "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
  });
  const webResetLink = `${process.env.BASE_URL}/reset-password/${token}`;
  const mobileResetLink = `${process.env.BASE_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: emailConfig?.from ?? `E-Cart <${process.env.NODE_MAILER_USER}>`,
    to: email,
    subject: emailConfig?.subject ?? "Password Reset",
    text:
      emailConfig?.text ||
      `We received a request to reset your password. To securely proceed, please select the appropriate link below based on your device:\n\n
        For web user: ${webResetLink}\n
        For mobile user: ${mobileResetLink}\n
        If you did not request this, please disregard this email.
        `,
  });
};
