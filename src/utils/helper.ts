import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer, { SendMailOptions } from "nodemailer";
import { nanoid } from "nanoid";
import { Response } from "express";
import { config } from "../config/env.config";

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateSKU = (name: string): string => {
  const prefix = name.substring(0, 3).toUpperCase();
  const unique = nanoid(6).toUpperCase();
  return `${prefix}-${unique}`;
};

export const generateRandomToken = (length: number = 64) => {
  return crypto.randomBytes(length).toString("hex");
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

export const sendEmail = async (
  emailConfig: {
    service?: string;
    from?: string;
    emailRecipient: string;
    subject: string;
    text: string;
  } & SendMailOptions
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: emailConfig?.service ?? "gmail",
      auth: {
        user: config.mailer.user,
        pass: config.mailer.pass,
      },
    });
    await transporter.sendMail({
      from: emailConfig?.from ?? `E-Cart <${config.mailer.user}>`,
      to: emailConfig.emailRecipient,
      ...emailConfig,
    });
  } catch (error) {
    throw error;
  }
};

export const sendSuccess = (
  res: Response,
  message: string = "Success",
  data: any = undefined,
  status = 200,
  statusCode = 1,
  meta: Record<string, any> = {}
) => {
  return res.status(status).json({ statusCode, message, ...meta, data });
};

export const sendError = (
  res: Response,
  message: string = "Something went wrong",
  error: any = undefined,
  status = 500,
  statusCode = 0,
  meta: Record<string, any> = {}
) => {
  return res.status(status).json({ statusCode, message, ...meta, error });
};
