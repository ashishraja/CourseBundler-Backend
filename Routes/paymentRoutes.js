import express from "express";
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from "../Controllers/paymentController.js";
import { isAuthenticatedUser } from "../Middleware/authentication.js";

const router = express.Router();

router.route("/subscription").get(isAuthenticatedUser , buySubscription);
router.route("/paymentverification").post(isAuthenticatedUser , paymentVerification);
router.route("/razorpaykey").get(getRazorPayKey);
router.route("/subscribe/cancel").delete(isAuthenticatedUser , cancelSubscription);
export default router;