import * as seeder from "./seeder";

(async () => {
  try {
    console.log("🌱 Seeding database...");
    await seeder.seedUsers();
    await seeder.seedProducts();
    await seeder.seedCategories();
    await seeder.seedRoles();
    await seeder.seedOrderStatuses();
    console.log("✅ All seeds completed");
  } catch (error) {
    console.error("❌ Error seeding database: ", error);
  }
})();
