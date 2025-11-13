import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import cartValidator from "../validators/cart";
import validateRequest from "../middlewares/validateRequest";
import cartController from "../controllers/cart";

const router = Router();
router.use(verifyToken);

router.get("/", cartValidator.getCart, validateRequest, cartController.handleGetCart);
router.post("/add", cartValidator.addCart, validateRequest, cartController.handleAddCartItem);
router.put("/edit/:id", cartValidator.editCart, validateRequest, cartController.handleEditCartItem);
router.delete("/:id", cartController.handleDeleteCartItem);
router.delete("/all", cartController.handleClearCart);

export default router;
