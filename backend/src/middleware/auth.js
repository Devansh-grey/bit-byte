import jwt from 'jsonwebtoken'
import { ENV } from '../utils/env.js'
import User from '../models/User.js'

// Removed unnecessary async — no await inside
const createToken = (userId, res) => {
    const token = jwt.sign(
        { userId },
        ENV.JWT_SECRET,
        { expiresIn: "7d" }
    )
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        httpOnly: true,
        sameSite:ENV.NODE_ENV === "production" ? "none" : "strict",
        secure: ENV.NODE_ENV !== "development" // true in production
    })

    return token
}

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" })
        }

        let decoded
        try {
            decoded = jwt.verify(token, ENV.JWT_SECRET)
        } catch {
            // Catches both TokenExpiredError and JsonWebTokenError
            return res.status(401).json({ message: "Unauthorized - Invalid or expired token" })
        }

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        req.user = user
        next()
    } catch (error) {
        console.error("Error in authenticator", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { createToken, authenticateUser }
