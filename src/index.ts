import express from "express";
import helmet from "helmet";
import productsRouter from "./routers/products";
import authRouter from "./routers/auth";
import mfaRouter from "./routers/mfa";
import cartRouter from "./routers/cart";
import categoriesRouter from "./routers/categories";
import dotenv from "dotenv";
import { globalLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.config";

dotenv.config();

const app = express();
const PORT = config.app.port;
const API_VERSION = config.app.api_version;

app.use(helmet());
app.use(globalLimiter);
app.use(cookieParser());
app.use(cors({ origin: config.app.cors_origin || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/mfa`, mfaRouter);
app.use(`/api/${API_VERSION}/products`, productsRouter);
app.use(`/api/${API_VERSION}/categories`, categoriesRouter);
app.use(`/api/${API_VERSION}/cart`, cartRouter);

app.use(errorHandler);

app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "Success!" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
