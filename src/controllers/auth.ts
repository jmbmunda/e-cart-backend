import { Request, Response } from "express";
import { findUserByEmailQuery } from "../models/user";
import {
  registerQuery,
  resetPasswordQuery,
  setTokenStatusQuery,
  storeResetTokenQuery,
  validateResetTokenQuery,
} from "../models/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, profile_picture, password } = req.body;
    const result = await findUserByEmailQuery(email);
    if (result.length) {
      return res.status(400).json({ statusCode: 0, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.toString(), salt);

    const values = { name, profile_picture, email, password: hashedPassword };
    const data = await registerQuery(values);
    return res.status(201).json({ statusCode: 1, message: "Account created", data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmailQuery(email);
    if (!user.length) {
      return res.status(400).json({ statusCode: 0, message: "Account does not exist" });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return res.status(400).json({ statusCode: 0, message: "Wrong password" });
    }

    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET! || "secret", {
      expiresIn: "1h",
    });
    res.status(200).json({ statusCode: 1, message: "Logged In Successfully", token });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmailQuery(email);
    if (!user.length) {
      return res.status(404).json({
        statusCode: 0,
        message: "No user found with this email address",
      });
    }

    const token = nanoid();
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 1hr

    await storeResetTokenQuery(user[0].id, token, expiry);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: "lezm wehb psbg fazv",
      },
    });
    const webResetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    const mobileResetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: `E-Cart <${process.env.NODE_MAILER_USER}>`,
      to: email,
      subject: "Password Reset",
      text: `We received a request to reset your password. To securely proceed, please select the appropriate link below based on your device:\n\n
    For web user: ${webResetLink}\n
    For mobile user: ${mobileResetLink}\n
    If you did not request this, please disregard this email.
    `,
    });

    return res.status(200).json({
      statusCode: 1,
      message: `Success! Reset password link has been sent to ${email}`,
    });
  } catch (error) {
    console.log("Forgot password", error);
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { reset_token, new_password } = req.body;

    const result = await validateResetTokenQuery(reset_token);
    if (result.length === 0)
      return res.status(400).json({ statusCode: 0, message: "Invalid token" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    await resetPasswordQuery(result[0].user_id, hashedPassword);

    await setTokenStatusQuery(reset_token);

    return res.status(200).json({
      statusCode: 1,
      message: "Password has been updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

export default { register, login, forgotPassword, resetPassword };
