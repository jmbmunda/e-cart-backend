import pool from "../../src/config/db";
import { ORDER_STATUSES } from "../../src/utils/constants";

export const seedOrderStatuses = async () => {
  for (const status in ORDER_STATUSES) {
    await pool.query(
      "INSERT INTO order_statuses (status) VALUES ($1) ON CONFLICT (status) DO NOTHING",
      [status]
    );
  }
};
