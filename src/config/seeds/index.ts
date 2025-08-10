import seeder from "./seeder";

(async () => {
  try {
    console.log("🌱 Seeding database...");
    await seeder.users();
    console.log("✅ All seeds completed");
  } catch (error) {
    console.error("❌ Error seeding database: ", error);
  }
})();
