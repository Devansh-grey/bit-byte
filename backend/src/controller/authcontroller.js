import User from "../models/User.js"
import bcrypt from 'bcrypt'
import { createToken } from "../middleware/auth.js"
import { sendWelcomeEmail, sendVerificationEmail } from "../email/emailHandler.js"
import { ENV } from "../utils/env.js"
import crypto from "crypto"


const generateVerificationToken = () => crypto.randomBytes(32).toString('hex')

const buildVerificationURL = (token) =>
    `${ENV.SERVER_URL}/api/auth/verify-email?token=${token}`


const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {
        const exist = await User.findOne({ email })
        if (exist) {

            if (!exist.isVerrified) {
                return res.status(409).json({
                    success: false,
                    unverified: true,
                    message: "Account exists but is not verified. Check your inbox or resend the verification email."
                })
            }

            return res.status(409).json({
                success: false,
                message: "User already exists, try logging in"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const verificationToken = generateVerificationToken()
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            isVerrified: false,
            verificationToken,
            verificationTokenExpiry
        })
        const savedUser = await user.save()

        try {
            await sendVerificationEmail(
                user.email,
                user.fullName,
                buildVerificationURL(verificationToken)
            )
        } catch (emailErr) {
            await User.deleteOne({ _id: user._id })
            console.error("Verification email failed, rolling back user:", emailErr)
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            })
        }

        return res.status(201).json({
            success: true,
            pending: true,
            message: "Account created! Please check your email to verify your account."
        })

    } catch (error) {
        console.error("Error in signup controller:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query

        if (!token) {
            return res.status(400).json({ success: false, message: "Verification token is required" })
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() }
        })

        if (!user) {
            return res.redirect(`${ENV.CLIENT_URL}/login?verified=invalid`)
        }

        user.isVerified = true
        user.verificationToken = null
        user.verificationTokenExpiry = null
        await user.save()

        createToken(user._id, res)

        sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL)
            .catch(err => console.error("Welcome email failed:", err))

        return res.redirect(`${ENV.CLIENT_URL}/?verified=true`)

    } catch (error) {
        console.error("Error in verifyEmail:", error.message)
        return res.redirect(`${ENV.CLIENT_URL}/login?verified=error`)
    }
}


const resendVerification = async (req,res) => {
    try {
        const {email} = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" })
        }

        const user = await User.findOne({email: email.toLowerCase().trim()})

        if (!user || user.isVerified) {
            return res.status(200).json({
                success: true,
                message: "If that email exists and is unverified, a new link has been sent."
            })
        }

        if (user.verificationTokenExpiry && user.verificationTokenExpiry > new Date(Date.now()+ 23*60*60*1000 - 60*1000)) {
            return res.status(429).json({
                success: false,
                message: "Please wait a minute before requesting a new link."
            })
        }

        const verificationToken = generateVerificationToken()
        user.verificationToken = verificationToken
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await user.save()

        await sendVerificationEmail(
            user.email,
            user.fullName,
            buildVerificationURL(verificationToken)
        )

        return res.status(200).json({
            success: true,
            message: "A new verification link has been sent to your email."
        })

    } catch (error) {
        console.error("Error in resendVerification:", error.message)
        res.status(500).json({ success: false, message: "Internal server error" })
    
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

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                unverified: true,
                message: "Please verify your email before logging in. Check your inbox or request a new link."
            })
        }

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
    res.cookie("jwt", "", {
        maxAge: 0,
        sameSite: ENV.NODE_ENV === "production" ? "none" : "strict",
        secure: true
    })
    res.status(200).json({ message: "Logged out successfully" })
}

const checkAuth = (req, res) => {
    res.status(200).json({
        success: true,
        _id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        email: req.user.email,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
        lastSeen: req.user.lastSeen
    })
}

export { signup,verifyEmail,resendVerification, login, logout, checkAuth }