import express from "express";
import ordersController from "../controllers/orders";
import ordersValidator from "../validators/orders";
import verifyToken from "../middlewares/verifyToken";
import validateRequest from "../middlewares/validateRequest";

const router = express.Router();
router.use(verifyToken);

router.get("/", ordersValidator.getOrders, validateRequest, ordersController.handleGetOrders);
router.post("/add", ordersValidator.addOrder, validateRequest, ordersController.handleAddOrder);
router.post(
  "/:id/process",
  ordersValidator.orderId,
  validateRequest,
  ordersController.handleProcessOrder
);
router.post(
  "/:id/ship",
  ordersValidator.orderId,
  validateRequest,
  ordersController.handleShipOrder
);
router.post(
  "/:id/deliver",
  ordersValidator.orderId,
  validateRequest,
  ordersController.handleDeliverOrder
);
router.post(
  "/:id/complete",
  ordersValidator.orderId,
  validateRequest,
  ordersController.handleCompleteOrder
);
router.post(
  "/:id/cancel",
  ordersValidator.orderId,
  validateRequest,
  ordersController.handleCancelOrder
);

export default router;
