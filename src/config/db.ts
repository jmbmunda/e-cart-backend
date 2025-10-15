import { Pool } from "pg";
import { config } from "./env.config";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

export default pool;
