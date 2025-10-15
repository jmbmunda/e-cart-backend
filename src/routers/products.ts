import express from "express";
import productsController from "../controllers/products";
import productValidator from "../validators/products";
import validateRequest from "../middlewares/validateRequest";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  productValidator.getProducts,
  validateRequest,
  productsController.getProducts
);
router.get("/:id", verifyToken, productsController.getProductById);
router.post(
  "/add",
  verifyToken,
  productValidator.addProduct,
  validateRequest,
  productsController.addProduct
);
router.put(
  "/edit/:id",
  verifyToken,
  productValidator.editProduct,
  validateRequest,
  productsController.editProduct
);
router.delete("/:id", verifyToken, productsController.deleteProduct);

export default router;
