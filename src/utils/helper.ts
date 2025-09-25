import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashSecret = async (secret: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(secret, salt);
};

export const compareSecret = async (secret: string, hashedSecret: string) => {
  return await bcrypt.compare(secret, hashedSecret);
};

export const generateResponse = ({
  status = 200,
  statusCode = 1,
  message = "Success!",
}: {
  status?: number;
  statusCode?: number;
  message?: string;
}) => {
  return {
    status,
    json: {
      statusCode,
      message,
    },
  };
};

export const sendEmail = async (emailConfig: {
  service?: string;
  from?: string;
  emailRecipient: string;
  subject: string;
  text: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: emailConfig?.service ?? "gmail",
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS,
      },
    });
    await transporter.sendMail({
      from: emailConfig?.from ?? `E-Cart <${process.env.NODE_MAILER_USER}>`,
      to: emailConfig.emailRecipient,
      subject: emailConfig.subject,
      text: emailConfig.text,
    });
  } catch (error) {
    throw error;
  }
};

export const generateSKU = (name: string): string => {
  const prefix = name.substring(0, 3).toUpperCase();
  const unique = nanoid(6).toUpperCase();
  return `${prefix}-${unique}`;
};
