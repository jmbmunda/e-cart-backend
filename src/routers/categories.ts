import express from "express";
import verifyToken from "../middlewares/verifyToken";
import validateRequest from "../middlewares/validateRequest";
import categoriesValidator from "../validators/categories";
import categoriesController from "../controllers/categories";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  categoriesValidator.getCategories,
  validateRequest,
  categoriesController.getCategories
);

router.post(
  "/add",
  verifyToken,
  categoriesValidator.addCategory,
  validateRequest,
  categoriesController.addCategory
);

router.put(
  "/edit/:id",
  verifyToken,
  categoriesValidator.editCategory,
  validateRequest,
  categoriesController.editCategory
);

router.delete("/:id", verifyToken, categoriesController.deleteCategory);

export default router;
