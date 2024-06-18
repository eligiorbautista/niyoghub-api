import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },

    // attributes for email verification and password reset
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // attributes for chat functionality
    online: { type: Boolean, default: false },
    conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }]
});

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
