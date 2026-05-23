const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // ✨ THE SECURITY LOCK: Automatically purges this document from MongoDB after 300 seconds (5 minutes)!
        },
    },
    { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;