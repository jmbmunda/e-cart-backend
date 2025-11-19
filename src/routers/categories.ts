import express from "express";
import verifyToken from "../middlewares/verifyToken";
import validateRequest from "../middlewares/validateRequest";
import categoriesValidator from "../validators/categories";
import categoriesController from "../controllers/categories";
import { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();
router.use(verifyToken);

router.get(
  "/",
  categoriesValidator.getCategories,
  validateRequest,
  categoriesController.handleGetCategories
);

router.post(
  "/add",
  authorizeRoles(["admin"]),
  categoriesValidator.addCategory,
  validateRequest,
  categoriesController.handleAddCategory
);

router.put(
  "/edit/:id",
  authorizeRoles(["admin"]),
  categoriesValidator.editCategory,
  validateRequest,
  categoriesController.handleEditCategory
);

router.delete("/:id", authorizeRoles(["admin"]), categoriesController.handleDeleteCategory);

export default router;
