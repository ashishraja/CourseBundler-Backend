import express from "express";
import { getDashboardStats } from "../Controllers/otherControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../Middleware/authentication.js";

const router = express.Router();

router.route("/admin/stats").get(isAuthenticatedUser , authorizeRoles , getDashboardStats);

export default router;