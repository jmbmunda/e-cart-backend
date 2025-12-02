import pool from "../../src/config/db";
import { ProductType } from "../../src/utils/types";

const products: Omit<ProductType, "id">[] = [
  {
    sku: "SKU-IPHONE15-BLK",
    name: "iPhone 15 Pro",
    description: "Latest Apple iPhone with A17 Pro chip and titanium frame.",
    price: 1299.99,
    stock: 50,
    category: "Electronics",
    thumbnail:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    sku: "SKU-NIKE-AF1-WHT",
    name: "Nike Air Force 1",
    description: "Classic white Nike Air Force 1 sneakers.",
    price: 120.0,
    stock: 200,
    category: "Shoes",
    thumbnail:
      "https://marvel-b1-cdn.bc0a.com/f00000000114841/www.florsheim.com/shop/index/FW25-FL-R1-MainContainerPace-Desktop.jpg",
  },
  {
    sku: "SKU-DELL-XPS13",
    name: "Dell XPS 13",
    description: "High-performance ultrabook with Intel i7 processor.",
    price: 999.99,
    stock: 30,
    category: "Computers",
    thumbnail:
      "https://img.freepik.com/premium-vector/flat-design-illustration-computer-set_636138-3175.jpg?semt=ais_incoming&w=740&q=80",
  },
];

const productImages = [
  {
    sku: "SKU-NIKE-AF1-WHT",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Nike_Cortez.jpg",
        is_thumbnail: true,
      },
      {
        url: "https://img.businessoffashion.com/resizer/v2/QUFZGXBIEBE5ZNB2RO4CE6MFBU.jpg?auth=27008dd504611610090726c99c58773762cc58683eb668ec193cf000c0fc13ad&width=1440",
        is_thumbnail: false,
      },
    ],
  },
  {
    sku: "SKU-IPHONE15-BLK",
    images: [
      {
        url: "https://www.hindustantimes.com/ht-img/img/2024/11/17/550x309/pexels-thnhphng1520-3611797_1728973560894_1731860711817.jpg",
        is_thumbnail: true,
      },
      {
        url: "https://www.slamdunk.gr/3130945-product_large/jordan-wmns-air-1-mid.jpg",
        is_thumbnail: false,
      },
    ],
  },
];

export const seedProducts = async () => {
  for (const p of products) {
    await pool.query(
      "INSERT INTO products (sku, name, description, price, stock, category, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (sku) DO NOTHING",
      [p.sku, p.name, p.description, p.price, p.stock, p.category, p.thumbnail]
    );
  }

  for (const pi of productImages) {
    const { rows } = await pool.query(`SELECT id FROM products WHERE sku = $1`, [pi.sku]);
    const productId = rows[0]?.id;
    for (const img of pi.images) {
      if (productId) {
        await pool.query(
          `INSERT INTO product_images (product_id, url, is_thumbnail) VALUES ($1, $2, $3) ON CONFLICT (product_id) WHERE is_thumbnail = TRUE DO NOTHING`,
          [productId, img.url, img.is_thumbnail]
        );
      }
    }
  }
};
