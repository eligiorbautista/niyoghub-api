import { Strategy as LocalAdminStrategy } from "passport-local";
import Admin from "../../models/Admin.mjs";
import { comparePasswords } from "../../utilities/helpers.mjs";
import passport from "passport";

passport.use(
  new LocalAdminStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          return done(null, false, { message: "Admin not found" });
        }
        console.log(admin);
        const isPasswordValid = await comparePasswords(
          password,
          admin.password
        );
        if (!isPasswordValid) {
          return done(null, false, { message: "Bad Credentials" });
        }

        done(null, admin);
      } catch (error) {
        console.error("Error in Local admin strategy:", error);
        done(error);
      }
    }
  )
);

export default passport;
