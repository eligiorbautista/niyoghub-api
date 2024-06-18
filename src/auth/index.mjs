import passport from "passport";
import User from "../models/User.mjs";
import Admin from "../models/Admin.mjs";
import googleUserStrategy from "./strategies/googleUserStrategy.mjs";
import facebookUserStrategy from "./strategies/facebookUserStrategy.mjs";
import localAdminStrategy from "./strategies/localAdminStrategy.mjs";
import localUserStrategy from "./strategies/localUserStrategy.mjs";

passport.use("google", googleUserStrategy);
passport.use("facebook", facebookUserStrategy);
passport.use("local-user", localUserStrategy);
passport.use("local-admin", localAdminStrategy);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, { id: user.id, accountType: user.accountType });
});

// Deserialize user
passport.deserializeUser(async (userData, done) => {
  try {
    if (
      userData.accountType === "local-account" ||
      userData.accountType === "google-account" ||
      userData.accountType === "facebook-account"
    ) {
      // Add facebook-account
      const user = await User.findById(userData.id);
      done(null, user);
    } else {
      const admin = await Admin.findById(userData.id);
      done(null, admin);
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
