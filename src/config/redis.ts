import { createClient } from "redis";
import { config } from "./env.config";

const client = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

client.on("connect", () => console.log("Redis Connected"));
client.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    if (!client.isOpen) await client.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default client;
