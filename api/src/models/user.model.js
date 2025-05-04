import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        lowercase: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true, 
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false, 
    },

    profilePic: {
        type: String,
        default: ""
    },

    isAdmin: {
        type: Boolean,
        default: false,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    refreshToken: {
        type: String,
        select: false, 
    },

    otp: {
        type: String,
    },

    otpExpires: {
        type: Date,
    },
    
}, {
    timestamps: true,
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); 

    try {
        const salt = await bcrypt.genSalt(10); 
        this.password = await bcrypt.hash(this.password, salt); 
        next(); 
    } catch (err) {
        next(err); 
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw new Error("Error comparing passwords");
    }
};

const User = mongoose.model("User", userSchema);

export default User;
