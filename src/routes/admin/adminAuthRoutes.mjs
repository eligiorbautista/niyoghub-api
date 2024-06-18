import express from 'express';
import { admin } from '../../controllers/admin/auth.mjs';
import { isAuthenticated } from '../../middlewares/authAdmin.mjs';

const router = express.Router();

// Public routes
router.post('/admin/auth/login', admin.login);
router.get('/admin/auth/status', admin.getStatus); // Check admin status
router.post('/admin/auth/register', admin.register);

// Private routes - Requires authentication
router.post('/admin/auth/logout', isAuthenticated, admin.logout);
router.post('/admin/auth/change-password', isAuthenticated, admin.changePasswordWithOTP);
router.post('/admin/auth/request-otp', isAuthenticated, admin.requestOTPForPasswordChange);
router.post('/admin/auth/forgot-password', admin.forgotPassword); // No authentication required for password reset
router.post('/admin/auth/reset-password', admin.resetPassword); // No authentication required for password reset

export default router;
