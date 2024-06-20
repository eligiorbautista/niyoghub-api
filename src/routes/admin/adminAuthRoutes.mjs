import { Router } from "express";
import { admin } from "../../controllers/admin/auth.mjs";
import { isAdminAuthenticated } from "../../middlewares/authAdmin.mjs";

const router = Router();

// Public routes
router.post("/admin/auth/register", admin.register);
router.post("/admin/auth/login", admin.login);
router.post("/admin/auth/forgot-password", admin.forgotPassword); // No authentication required for password reset
router.post("/admin/auth/reset-password", admin.resetPassword); // No authentication required for password reset
router.get("/admin/auth/status", admin.getStatus); // Check admin status

// Private routes - Requires authentication
router.post(
  "/admin/auth/change-password",
  isAdminAuthenticated,
  admin.changePasswordWithOTP
);
router.post(
  "/admin/auth/request-otp",
  isAdminAuthenticated,
  admin.requestOTPForPasswordChange
);

// Routes for admin authentication with OTP verification
router.post("/admin/auth/verify-otp", admin.verifyOTP);
router.post("/admin/auth/enable-two-factor", admin.enableTwoFactor);
router.post("/admin/auth/disable-two-factor", admin.disableTwoFactor);

export default router;
