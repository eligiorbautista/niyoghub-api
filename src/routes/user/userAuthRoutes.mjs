import { Router } from "express";
import { user } from "../../controllers/user/auth.mjs";
import { isUserAuthenticated } from "../../middlewares/authUser.mjs";
import { loginLimiter } from "../../middlewares/authUserLimiter.mjs";

const router = Router();

// Public routes
// ================================
router.post("/user/auth/register", user.register);
router.post("/user/auth/login", loginLimiter, user.login);
router.get("/user/auth/status", user.getStatus);

// Google OAuth routes
router.get("/user/auth/google", user.googleAuth);
router.get("/user/auth/google/callback", user.googleAuthCallback);

// Facebook OAuth routes
router.get("/user/auth/facebook", user.facebookAuth);
router.get("/user/auth/facebook/callback", user.facebookAuthCallback);

// Password management routes
router.post(
  "/user/auth/password/request-otp",
  user.requestOTPForPasswordChange
);
router.post("/user/auth/password/forgot", user.forgotPassword);
router.post("/user/auth/password/reset", user.resetPassword);

// Private routes
// ================================
router.post(
  "/user/auth/password/change",
  isUserAuthenticated,
  user.changePasswordWithOTP
);

export default router;
