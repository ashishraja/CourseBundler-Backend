import express from "express";
import { contact, courseRequest, getDashboardStats } from "../Controllers/otherControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../Middleware/authentication.js";

const router = express.Router();


router.route("/contact").post(contact);
router.route("/requestcourse").post(courseRequest);
router.route("/admin/stats").get(isAuthenticatedUser , authorizeRoles , getDashboardStats);
export default router;