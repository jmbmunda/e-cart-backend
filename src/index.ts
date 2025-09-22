import express from "express";
import helmet from "helmet";
import productsRouter from "./routers/products";
import authRouter from "./routers/auth";
import mfaRouter from "./routers/mfa";
import dotenv from "dotenv";
import { globalLimiter } from "./middlewares/rateLimit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(globalLimiter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/mfa", mfaRouter);

app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "Success!" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
