import mongoose, {Schema} from "mongoose"; 
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { USER_ROLES } from "../constants.js";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long']
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
            index: true
        },
        department: {
            type: String,
            enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Design', 'Support', 'Management'],
            default: 'Operations',
            index: true
        },
        jobTitle: {
            type: String,
            trim: true,
            maxlength: [100, 'Job title cannot exceed 100 characters']
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            default: null
        },
        emailVerificationExpires: {
            type: Date,
            default: null
        },
        passwordResetToken: {
            type: String,
            default: null
        },
        passwordResetExpires: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String,
            default: null
        },
        lastLogin: {
            type: Date,
            default: null
        }
    }, {
        timestamps: true
    }
)


// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

// Method to compare password
userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Generate Access Token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
            firstName: this.firstName,
            lastName: this.lastName
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
    )
}

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this._id
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    )
}

// Generate Email Verification Token
userSchema.methods.generateEmailVerificationToken = function() {
    const token = jwt.sign(
        { id: this._id, email: this.email },
        process.env.EMAIL_VERIFICATION_SECRET || 'email-secret',
        { expiresIn: '24h' }
    );
    this.emailVerificationToken = token;
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token;
}

// Method to check if user has specific role
userSchema.methods.hasRole = function(role) {
    return this.role === role;
}

// Method to check if user is admin or manager
userSchema.methods.isAdminOrManager = function() {
    return this.role === USER_ROLES.ADMIN || this.role === USER_ROLES.MANAGER;
}

export const User = mongoose.model("User", userSchema)