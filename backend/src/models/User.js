import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        unique: true,
        sparse: true  // allows multiple docs without username (null != null in sparse index)
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    profilePic: { 
        type: String, 
        default: '' 
    },
    bio: {
        type: String,
        default: '',
        maxlength: 160
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isVerrified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User