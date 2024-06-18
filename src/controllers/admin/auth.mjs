import passport from "passport";
import Admin from "../../models/Admin.mjs";
import { encryptPassword, comparePasswords } from "../../utilities/helpers.mjs";
import { sendEmail } from "../../services/sendEmail.mjs";
import { generateOTP } from "../../services/generateOTP.mjs";

import "../../auth/strategies/localAdminStrategy.mjs";
import "../../auth/index.mjs";

export const admin = {
  // Login Admin with OTP Verification
  login: async (req, res, next) => {
    passport.authenticate("local", async (err, admin, info) => {
      try {
        if (err) {
          return next(err);
        }
        if (!admin) {
          return res.status(401).json({ message: info.message });
        }

        // Log in the admin if authentication successful
        req.logIn(admin, (err) => {
          if (err) {
            return next(err);
          }
          res.json({ message: "Logged in successfully" });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },

  // Register Admin
  register: async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = encryptPassword(password);

    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  },

  // Logout Admin
  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie("sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  },

  // Check Admin Status
  getStatus: async (req, res) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Status: Admin Not Logged In" });
    }
    res.status(200).json({ message: "Status: Logged In", admin: req.admin });
  },

  // Change Admin Password with OTP Verification
  changePasswordWithOTP: async (req, res) => {
    const { email, newPassword, otp } = req.body;

    // Retrieve admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify OTP
    if (admin.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password
    admin.password = encryptPassword(newPassword);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  },

  // Request OTP for Password Change
  requestOTPForPasswordChange: async (req, res) => {
    const { email } = req.body;

    // Retrieve admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    admin.otp = otp;
    await admin.save();

    // Send OTP to admin via email
    try {
      await sendEmail(
        admin.email,
        "OTP for Password Change",
        `Your OTP is: ${otp}`
      );
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    admin.otp = otp;
    await admin.save();

    // Send OTP to admin via email
    try {
      await sendEmail(
        admin.email,
        "OTP for Password Reset",
        `Your OTP is: ${otp}`
      );
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    const { email, newPassword, otp } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify OTP
    if (admin.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password
    admin.password = encryptPassword(newPassword);
    await admin.save();

    res.json({ message: "Password reset successfully" });
  },
};
