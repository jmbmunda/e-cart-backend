import express from "express";
import productsController from "../controllers/products";
import productValidator from "../validators/products";
import validateRequest from "../middlewares/validateRequest";
import verifyToken from "../middlewares/verifyToken";
import { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();
router.use(verifyToken);

router.get("/", productValidator.getProducts, validateRequest, productsController.getProducts);
router.get("/:id", productsController.getProductById);
router.post(
  "/add",
  authorizeRoles(["seller"]),
  productValidator.addProduct,
  validateRequest,
  productsController.addProduct
);
router.put(
  "/edit/:id",
  authorizeRoles(["seller"]),
  productValidator.editProduct,
  validateRequest,
  productsController.editProduct
);
router.delete("/:id", authorizeRoles(["seller"]), productsController.deleteProduct);

export default router;
