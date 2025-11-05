import pool from "../../src/config/db";
import { CategoryType } from "../../src/utils/types";

const categories: CategoryType[] = [
  {
    name: "Shirts",
    slug: "shirts",
    is_active: true,
    thumbnail:
      "https://static.vecteezy.com/system/resources/previews/030/369/446/non_2x/professional-white-t-shirt-for-mockup-design-ai-generated-free-photo.jpg",
  },
  {
    name: "Electronics",
    slug: "electronics",
    is_active: true,
    thumbnail:
      "https://media.istockphoto.com/id/1372577388/photo/old-electronic-devices-on-a-dark-background-the-concept-of-recycling-and-disposal-of.webp?b=1&s=612x612&w=0&k=20&c=yeY_QjBDbFj-Tq2CGjXKpotgaGh7MUgATFa2F9-mDiE=",
  },
  {
    name: "Mobile Phones",
    slug: "mobile-phones",
    is_active: true,
    thumbnail:
      "https://media.wired.com/photos/6831137f6efa792c1c1cc0f9/master/w_1600%2Cc_limit/Samsung%2520Galaxy%2520S25%2520Edge_%2520Photograph%2520Julian%2520Chokkattu.png",
  },
  {
    name: "Shoes",
    slug: "shoes",
    is_active: true,
    thumbnail:
      "https://media.istockphoto.com/id/1877194618/video/goodwill-charity-shoes-pile-brandless-generics.jpg?s=640x640&k=20&c=-HHdHkzhqNhRDwcPTrj7_rDGRrpS_E17ZHBc5uit460=",
  },
];

export const seedCategories = async () => {
  for (const c of categories) {
    await pool.query(
      "INSERT INTO categories (name, slug, is_active, thumbnail) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING",
      [c.name, c.slug, c.is_active, c.thumbnail]
    );
  }
};
