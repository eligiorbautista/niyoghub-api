import { Strategy as LocalStrategy } from "passport-local";
import User from "../../models/User.mjs";
import Admin from "../../models/Admin.mjs";
import { comparePasswords } from "../../utilities/helpers.mjs";

const localUserStrategy = new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      // Check User
      let user = await User.findOne({ email });
      if (user) {
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          console.log("Bad Credentials @localUserStrategy");
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, { ...user.toObject(), accountType: "local-user" });
      }

      // Check Admin if User is not found
      let admin = await Admin.findOne({ email });
      if (admin) {
        const isPasswordValid = await comparePasswords(
          password,
          admin.password
        );
        if (!isPasswordValid) {
          console.log("Bad Credentials @localAdminStrategy");
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, { ...admin.toObject(), accountType: "local-admin" });
      }

      // Admin and user not found
      return done(null, false, { message: "User or Admin not found" });
    } catch (error) {
      console.error("Error in Local strategy:", error);
      done(error);
    }
  }
);

export default localUserStrategy;
