import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  googleId: { type: "string", default: "N/A" },
  facebookId: { type: "string", default: "N/A" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // for local users only
  city: { type: String, required: true, default: "Not specified" },
  language: {
    type: String,
    required: true,
    default: "English",
    enum: ["English", "Filipino"],
  },
  // displayName: {
  //   type: String,
  //   virtual: true,
  //   get: function () {
  //     return `${this.firstName} ${this.lastName}`;
  //   },
  // },
  displayName: {
    type: String,
    default: function () {
      return `${this.firstName} ${this.lastName}`;
    },
  },
  profilePicture: { type: Buffer },
  accountType: {
    type: String,
    enum: ["local-account", "google-account", "facebook-account"],
    default: "local-account",
  },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpiry: { type: Date },

  // attributes for email verification and password reset
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null }, // for local users only
  resetPasswordExpires: { type: Date, default: null }, // for local users only

  // attributes for chat functionality
  online: { type: Boolean, default: false },
  conversations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  ],

  // notification preferences
  receiveAnnouncementNotifications: { type: Boolean, default: true },
  receiveArticleNotifications: { type: Boolean, default: true },
  receiveChatNotifications: { type: Boolean, default: true },
});

const User = mongoose.model("User", UserSchema);

export default User;
