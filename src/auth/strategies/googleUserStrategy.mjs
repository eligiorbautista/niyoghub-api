import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/User.mjs';
import dotenv from 'dotenv';

dotenv.config();

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


const googleUserStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      
      // If user already exists, log them in
      if (user) {
        return done(null, user);
      }

      // If user doesn't exist, register them
      user = new User({
        displayName: `${capitalize(profile.name.givenName)} ${capitalize(profile.name.familyName)}` , 
        googleId: profile.id,
        firstName: capitalize(profile.name.givenName),  
        lastName: capitalize(profile.name.familyName),
        email: profile.emails[0].value,
        accountType: 'google-account', 
      });
      await user.save();
      
      // Log in the user
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
);

export default googleUserStrategy;
