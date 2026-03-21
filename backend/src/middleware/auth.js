import jwt from 'jsonwebtoken'
import { ENV } from '../utils/env.js'
import User from '../models/User.js'

const createToken = async (userId,res) => {
    const token = jwt.sign(
        {userId},
        ENV.JWT_SECRET,
        {expiresIn:"7d"}
    )
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000, //in ms
        httpOnly:true,
        sameSite:"strict",
        secure: ENV.NODE_ENV === "development" ? false : true
    })

    return token
}

const authenticateUser = async (req,res,next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({message:"Unauthorized - No token provided"})
        }
        const decoded = jwt.verify(token,ENV.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({message:"Unauthorized - Invalid token"})
        }
        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            return res.status(404).json({message:"User not found"})
        }
        req.user=user
        next()
    } catch (error) {
        console.error("Error in authenticator",error.message);
        res.status(500).json({message:"Internal server error"})
    }
}

export {createToken,authenticateUser}

