import express from "express";
import productsController from "../controllers/products";
import productValidator from "../validators/products";
import validateRequest from "../middlewares/validateRequest";
import verifyToken from "../middlewares/verifyToken";
import { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();
router.use(verifyToken);

router.get(
  "/",
  productValidator.getProducts,
  validateRequest,
  productsController.handleGetProducts
);
router.get("/:id", productsController.handleGetProductById);
router.post(
  "/add",
  authorizeRoles(["seller"]),
  productValidator.addProduct,
  validateRequest,
  productsController.handleAddProduct
);
router.put(
  "/edit/:id",
  authorizeRoles(["seller"]),
  productValidator.editProduct,
  validateRequest,
  productsController.handleEditProduct
);
router.delete("/:id", authorizeRoles(["seller"]), productsController.handleDeleteProduct);

export default router;
