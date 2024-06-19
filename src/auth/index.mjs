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

// Deserialize admin / user
passport.deserializeUser(async (userData, done) => {
  console.log(userData.accountType);
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
