import User from "../models/User.js"
import bcrypt from 'bcrypt'
import { createToken } from "../middleware/auth.js"
import { sendWelcomeEmail } from "../email/emailHandler.js"
import { ENV } from "../utils/env.js"
import cloudinary from "../utils/cloudinary.js"

const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {
        const exist = await User.findOne({ email })
        if (exist) {
            return res.status(409).json({
                success: false,
                message: "User already exists, try logging in"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User({ fullName, email, password: hashedPassword })
        const savedUser = await user.save()

        // createToken is no longer async — no await needed
        createToken(savedUser._id, res)

        res.status(201).json({
            success: true,
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            profilePic: savedUser.profilePic
        })

        // Fire-and-forget welcome email (non-blocking, intentional)
        sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL)
            .catch(err => console.error("Failed to send welcome email:", err))

    } catch (error) {
        console.error("Error in signup controller:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isPassword = await bcrypt.compare(password, user.password)
        if (!isPassword) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // createToken is no longer async — no await needed
        createToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.error("Error in login controller:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

const logout = (_, res) => {
    // Fixed: cookie name must match what createToken sets ("jwt", not "token")
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logged out successfully" })
}

const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" })
        }

        const userId = req.user._id
        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password")

        res.status(200).json({ updatedUser })

    } catch (error) {
        console.error("Error in updateProfile controller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { signup, login, logout, updateProfile }