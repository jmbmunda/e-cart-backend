import * as seeder from "./seeder";

(async () => {
  try {
    console.log("🌱 Seeding database...");
    await seeder.seedUsers();
    await seeder.seedProducts();
    console.log("✅ All seeds completed");
  } catch (error) {
    console.error("❌ Error seeding database: ", error);
  }
})();
