import express from "express";
import mfaValidator from "../validators/mfa";
import mfaController from "../controllers/mfa";
import validateRequest from "../middlewares/validateRequest";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

router.post("/setup", verifyToken, mfaValidator.setup, validateRequest, mfaController.mfaSetup);
router.post("/verify", mfaValidator.verify, validateRequest, mfaController.mfaVerify);
router.post("/otp/send", mfaValidator.send, validateRequest, mfaController.otpSend);

export default router;
