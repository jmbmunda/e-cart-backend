import cron from "node-cron";
import pool from "../config/db";

console.log("✅ Worker started. Scheduling OTP cleanup job...");

cron.schedule("0 3 * * *", async () => {
  console.log("🧹 Running OTP cleanup...");
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM mfa_tokens
       WHERE created_at < NOW() - INTERVAL '90 days'`
    );
    console.log(`✅ OTP cleanup complete. Deleted ${rowCount} records.`);
  } catch (err) {
    console.error("❌ OTP cleanup failed:", err);
  }
});

setInterval(() => {}, 1000);
