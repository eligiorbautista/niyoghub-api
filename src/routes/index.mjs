import express from "express";
import adminAuthRoutes from "./admin/adminAuthRoutes.mjs";
import userAuthRoutes from "./user/userAuthRoutes.mjs";

const router = express.Router();

// Routes for Admin Authentication
router.use(adminAuthRoutes);

// Routes for User Authentication
router.use(userAuthRoutes);

export default router;
