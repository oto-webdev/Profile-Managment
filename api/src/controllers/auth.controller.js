import User from "../models/user.model.js"
import { transporter } from "../config/nodemailer.js"
import { generateOTP } from "../utils/otp.js"
import { generateToken, generateRefreshToken } from "../utils/token.js"
import { cloudinary } from "../config/cloudinary.js"

export const me = async (req, res) => {
    try{
        const user = req.user; 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin, 
            },
        });
    }catch(error) {
        res.status(500).json({ message: error.message })
    }
}

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        return res.status(409).json({ message: "Username is taken" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.status(409).json({ message: "Email address is taken" });
    }

    try {
        const user = await User.create({ 
            username,
            email, 
            password 
        });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 2 * 60 * 1000; 
        await user.save();

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: "Verify Your Email",
            text: `Your OTP is ${otp}`,
        });

        res.status(201).json({ message: "User registered. Please verify your email with the OTP sent." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 2 * 60 * 1000;  
        await user.save();

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: "Your OTP for Login",
            text: `Your OTP is ${otp}`
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            maxAge: 0, 
        });

        res.clearCookie("refresh_jwt", {
            maxAge: 0,
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        const token = generateToken(user._id, res);
        const refreshToken = generateRefreshToken(user._id, res);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Email verified and logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { username, email, profilePic } = req.body;
        let imageUrl = user.profilePic;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "profiles",
                width: 500,
                crop: "scale",
            });
            imageUrl = result.secure_url || imageUrl;
        } 

        else if (profilePic) {
            imageUrl = profilePic;
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.profilePic = imageUrl;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const deactivate = async (req, res) => {
    try {
        const result = await User.updateOne(
            { _id: req.user._id },
            { $set: { isActive: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account has been deactivated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAccaunt = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.profilePic) {
            const publicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`profiles/${publicId}`);
        }

        await user.deleteOne();

        res.clearCookie("jwt");
        res.clearCookie("refresh_jwt");

        res.status(200).json({ message: "Account has been permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};