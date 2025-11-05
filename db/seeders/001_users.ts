import pool from "../../src/config/db";
import bcrypt from "bcrypt";
import { UserType } from "../../src/utils/types";

const users: UserType<true>[] = [
  {
    name: "Guest",
    email: "guest@yopmail.com",
    password: "guest123",
    profile_picture:
      "https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png",
    role_id: "1",
  },
  {
    name: "Seller",
    email: "seller@yopmail.com",
    password: "seller123",
    profile_picture:
      "https://media.istockphoto.com/id/912819604/vector/storefront-flat-design-e-commerce-icon.jpg?s=612x612&w=0&k=20&c=_x_QQJKHw_B9Z2HcbA2d1FH1U1JVaErOAp2ywgmmoTI=",
    role_id: "2",
  },
];

export const seedUsers = async () => {
  for (const u of users) {
    const hashedPass = await bcrypt.hash(u.password!, 10);
    await pool.query(
      `INSERT INTO users ( name, email, password, profile_picture, role_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING;`,
      [u.name, u.email, hashedPass, u.profile_picture, u.role_id]
    );
  }
};
