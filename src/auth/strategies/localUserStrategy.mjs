import { Strategy as localUserStrategy } from "passport-local";
import User from "../../models/User.mjs";
import { comparePasswords } from "../../utilities/helpers.mjs";
import passport from "passport";

passport.use(
  new localUserStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Bad Credentials" });
        }

        done(null, user);
      } catch (error) {
        console.error("Error in Local strategy:", error);
        done(error);
      }
    }
  )
);

export default passport;
