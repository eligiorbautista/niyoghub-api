import passport from "passport";
import User from "../models/User.mjs";
import Admin from "../models/Admin.mjs";
import googleUserStrategy from "./strategies/googleUserStrategy.mjs";
import facebookUserStrategy from "./strategies/facebookUserStrategy.mjs";
import localStrategy from "./strategies/localStrategy.mjs";

// Strategies
passport.use("google", googleUserStrategy);
passport.use("facebook", facebookUserStrategy);
passport.use("local", localStrategy);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, { id: user._id, accountType: user.accountType });
});

// Deserialize admin / user
passport.deserializeUser(async (userData, done) => {
  try {
    if (userData.accountType === "local-admin") {
      const admin = await Admin.findById(userData.id);
      done(null, admin);
    } else {
      const user = await User.findById(userData.id);
      done(null, user);
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
