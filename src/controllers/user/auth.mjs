import passport from "passport";
import User from "../../models/User.mjs";
import { encryptPassword, comparePasswords } from "../../utilities/helpers.mjs";
import { sendEmail } from "../../services/sendEmail.mjs";
import { generateOTP } from "../../services/generateOTP.mjs";
import "../../auth/strategies/localUserStrategy.mjs";
import "../../auth/strategies/googleUserStrategy.mjs";
import "../../auth/strategies/facebookUserStrategy.mjs"; // Import the Facebook strategy
import "../../auth/index.mjs";

export const user = {
  // Google OAuth
  googleAuth: passport.authenticate("google", { scope: ["profile", "email"] }),

  // Google OAuth callback
  googleAuthCallback: (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ message: "Failed to authenticate with Google" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        console.log("Successfully authenticated with Google");
        res.status(200).json({
          message: "Google authentication successful",
          user: req.user,
        });
      });
    })(req, res, next);
  },

  // Facebook OAuth
  facebookAuth: passport.authenticate("facebook", { scope: ["email"] }),

  // Facebook OAuth callback
  facebookAuthCallback: (req, res, next) => {
    passport.authenticate("facebook", (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ message: "Failed to authenticate with Facebook" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        console.log("Successfully authenticated with Facebook");
        res.status(200).json({
          message: "Facebook authentication successful",
          user: req.user,
        });
      });
    })(req, res, next);
  },

  // Login User
  login: (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ message: "Logged in successfully", user: req.user });
      });
    })(req, res, next);
  },

  // Register User
  register: async (req, res) => {
    const { firstName, lastName, email, password, city, language } = req.body;

    // Validate the required fields
    if (!firstName || !lastName || !email || !password || !city || !language) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const hashedPassword = encryptPassword(password);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        city,
        language,
      });

      const savedUser = await newUser.save();

      res
        .status(201)
        .json({ message: "User registered successfully", user: savedUser });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  },

  // Logout User
  logout: (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Error logging out" });
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Error logging out" });
        res.clearCookie("sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  },

  // Check User Status
  getStatus: async (req, res) => {
    console.log(req.user);
    if (!req.user)
      return res.status(401).send({ message: "Status: User Not Logged In" });
    res.status(200).json({ msg: "Status: Logged In", user: req.user });
  },

  // Change User Password with OTP Verification
  changePasswordWithOTP: async (req, res) => {
    const { email, newPassword, otp } = req.body;

    // Retrieve user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password
    user.password = encryptPassword(newPassword);
    await user.save();
    user.otp = undefined;

    res.json({ message: "Password changed successfully" });
  },

  // Request OTP for Password Change
  requestOTPForPasswordChange: async (req, res) => {
    const { email } = req.body;

    // Retrieve user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    // Send OTP to user via email
    try {
      await sendEmail(
        user.email,
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    // Send OTP to user via email
    try {
      await sendEmail(
        user.email,
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password
    user.password = encryptPassword(newPassword);
    user.otp = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  },
};
