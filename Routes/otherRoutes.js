import express from "express";
import { getDashboardStats,download } from "../Controllers/otherControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../Middleware/authentication.js";

const router = express.Router();

router.route("/admin/stats").get(isAuthenticatedUser , authorizeRoles , getDashboardStats);
router.route("/certificate").get(download);

export default router;