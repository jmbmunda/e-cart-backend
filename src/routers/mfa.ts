import express from "express";
import mfaValidator from "../validators/mfa";
import mfaController from "../controllers/mfa";
import validateRequest from "../middlewares/validateRequest";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

router.post(
  "/setup",
  verifyToken,
  mfaValidator.setup,
  validateRequest,
  mfaController.handleMfaSetup
);
router.post("/verify", mfaValidator.verify, validateRequest, mfaController.handleMfaVerify);
router.post("/otp/send", mfaValidator.send, validateRequest, mfaController.handleOtpSend);

export default router;
