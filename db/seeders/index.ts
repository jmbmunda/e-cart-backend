import * as seeder from "./seeder";

(async () => {
  try {
    console.log("🌱 Seeding database...");
    await seeder.seedUsers();
    await seeder.seedProducts();
    await seeder.seedCategories();
    await seeder.seedRoles();
    console.log("✅ All seeds completed");
  } catch (error) {
    console.error("❌ Error seeding database: ", error);
  }
})();
