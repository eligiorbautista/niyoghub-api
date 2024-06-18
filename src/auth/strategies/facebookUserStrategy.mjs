import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../../models/User.mjs";
import dotenv from "dotenv";

dotenv.config();

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const facebookUserStrategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ["id", "emails", "name"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find the user by email
      let user = await User.findOne({ email: profile.emails[0].value });

      // If user already exists, log them in
      if (user) {
        return done(null, user);
      }

      // If user doesn't exist, register them
      user = new User({
        displayName: `${capitalize(profile.name.givenName)} ${capitalize(
          profile.name.familyName
        )}`,
        facebookId: profile.id,
        firstName: capitalize(profile.name.givenName),
        lastName: capitalize(profile.name.familyName),
        email: profile.emails[0].value,
        accountType: "facebook-account",
      });
      await user.save();

      // Log in the user
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
);

export default facebookUserStrategy;
