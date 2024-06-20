import passport from "passport";
import Admin from "../../models/Admin.mjs";
import { encryptPassword, comparePasswords } from "../../utilities/helpers.mjs";
import { sendEmail } from "../../services/sendEmail.mjs";
import { generateOTP } from "../../services/generateOTP.mjs";
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

        const existingAdmin = await Admin.findOne({ email: admin.email });

        if (admin.isTwoFactorEnabled) {
          // Gemerate OTP
          const otp = generateOTP();
          existingAdmin.otp = otp;
          existingAdmin.otpExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
          await existingAdmin.save();
          // Send OTP to admin via email
          await sendEmail(
            admin.email,
            "Your 2FA OTP Code",
            `
Dear Admin,

We have received a request to access your admin account. As part of our security measures, you are required to complete the Two-Factor Authentication (2FA) process.

Your One-Time Password (OTP) code is: ${otp}

Please note that this OTP is valid for only 1 minute. If the code expires, you will need to request a new one.

If you did not request this, please ignore this email and ensure your account is secure.

Best regards,
NiyogHub Team
            `
          );

          console.log(otp);
          return res.status(200).json({ message: "OTP sent for 2FA" });
        }

        // Log in the admin if authentication successful
        req.logIn(admin, (err) => {
          if (err) {
            return next(err);
          }
          console.log(`Admin login successfully`);
          res.json({ message: "Admin logged in successfully" });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },

  // Verify OTP for 2FA
  verifyOTP: async (req, res) => {
    const { email, otp } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (existingAdmin.otp !== otp || existingAdmin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    existingAdmin.otp = null;
    existingAdmin.otpExpiry = null;
    await existingAdmin.save();

    req.logIn(existingAdmin, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging in" });
      }
      res.json({ message: "Admin logged in successfully" });
    });
  },

  // Enable 2FA
  enableTwoFactor: async (req, res) => {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isTwoFactorEnabled = true;
    await admin.save();

    res.json({ message: "Two-factor authentication enabled" });
  },

  // Disable 2FA
  disableTwoFactor: async (req, res) => {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isTwoFactorEnabled = false;
    await admin.save();

    res.json({ message: "Two-factor authentication disabled" });
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
    req.logout();
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("sid");
      res.json({ message: "Logged out successfully" });
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
    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    admin.password = encryptPassword(newPassword);
    admin.otp = null;
    admin.otpExpiry = null;
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
    admin.otpExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
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
    admin.otpExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
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
    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    admin.password = encryptPassword(newPassword);
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    res.json({ message: "Password reset successfully" });
  },
};
