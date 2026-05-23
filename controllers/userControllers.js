const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const crypto = require("crypto");
const OTP = require("../models/otpModel");
const mailSender = require("../config/mailSender");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            pic,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Failed to create the user" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const allUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        // Find all users matching the keyword, except the currently logged-in user
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GENERATE AND DISPATCH EMAIL OTP ---
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email target path parameter is required." });
        }

        // 1. Generate a cryptographically secure, un-guessable 6-digit random token
        const generatedOtp = crypto.randomInt(100000, 999999).toString();

        // 2. Commit the token entry to your MongoDB Atlas cluster (expires automatically in 5 mins)
        await OTP.create({
            email: email,
            otp: generatedOtp
        });

        // 3. Compile a premium HTML email layout template
        const emailBody = `
      <div style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #06b6d4; margin-bottom: 4px;">Synapse Chat</h2>
        <p style="font-size: 12px; color: #64748b; text-transform: uppercase; tracking-letter: 1px;">Security Gateway Protocol</p>
        <hr style="border-color: #1e293b; margin: 20px 0;" />
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Your single-use connection authorization token has been generated. Input this synchronization index into your authentication screen matrix:</p>
        <div style="background-color: #0f172a; border: 1px solid #22d3ee; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #22d3ee;">${generatedOtp}</span>
        </div>
        <p style="font-size: 11px; color: #475569;">This token network lifecycle expires automatically in 5 minutes. If you did not initialize this pipeline handshake, disregard this packet transmission safely.</p>
      </div>
    `;

        // 4. Fire the transmission over the SMTP network highway
        await mailSender(email, "Synapse Verification Token Node", emailBody);

        res.status(200).json({ success: true, message: "Verification token dispatched cleanly to inbox." });
    } catch (error) {
        console.error("⚠️ OTP Controller Error:", error.message);
        res.status(500).json({ message: "Failed to transmit encryption token." });
    }
};

// --- CRYPTOGRAPHIC OTP VERIFICATION AND SIGNUP GATEWAY ---
const verifyOTP = async (req, res) => {
    try {
        const { name, email, password, pic, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP token are required." });
        }

        // Find the latest OTP document for the email
        const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!latestOtp || latestOtp.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired synchronization token matrix." });
        }

        // If signup fields are provided, perform full registration
        if (name && password) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: "User already exists." });
            }

            const user = await User.create({
                name,
                email,
                password,
                pic: pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
            });

            if (user) {
                // Purge verified OTPs
                await OTP.deleteMany({ email });

                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic,
                    token: generateToken(user._id),
                });
            } else {
                return res.status(400).json({ message: "Failed to create user node." });
            }
        } else {
            // OTP verification only (e.g. for login verification check)
            await OTP.deleteMany({ email });
            return res.status(200).json({ success: true, message: "OTP verified successfully." });
        }
    } catch (error) {
        console.error("⚠️ verifyOTP Controller Error:", error.message);
        res.status(500).json({ message: "Failed to verify synchronization token." });
    }
};

// Make sure to add allUsers to your exports at the very bottom!
module.exports = { registerUser, authUser, allUsers, sendOTP, verifyOTP };