import User from "../models/User.js"
import bcrypt from 'bcrypt'
import { createToken } from "../middleware/auth.js"
import { sendWelcomeEmail } from "../email/emailHandler.js"
import { ENV } from "../utils/env.js"
import cloudinary from "../utils/cloudinary.js"

const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {

        // checking existence of user
        const exist = await User.findOne({ email })
        if (exist) {
            return res.status(409).json({
                success: false,
                message: "user already exist try logging in"
            })
        }

        // hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // creating new user
        const user = new User({
            fullName,
            email,
            password: hashedPassword
        })
        const saveduser = await user.save()
        createToken(saveduser._id, res)

        res.status(201).json({
            success: true,
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

        // sending welcome email 
        try {
            await sendWelcomeEmail(saveduser.email, saveduser.fullName, ENV.CLIENT_URL)
        } catch (error) {
            console.error("Failed to send welcome email", error);

        }


    } catch (error) {
        console.log("error in auth Controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPassword = await bcrypt.compare(password,user.password);
        if (!isPassword) {
             return res.status(400).json({ message: "Invalid credentials" });
        }
        createToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })


    } catch (error) {
        console.error("Error in login controller",error.message);
        res.status(500).json({message:"Internal server error"})
    }
}

const logout = async (_, res) => {
    res.cookie("token","",{maxAge:0})
    res.status(200).json({message:"Logged out successfully"})
}

const updateProfile = async (req,res) => {
try {
    const {profilePic} = req.body
    if (!profilePic) {
        return res.status(400).json({message:"Profile pic is required"})
    }
    const userId = req.user._id
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {profilePic:uploadResponse.secure_url},
        {new:true})
        .select("-password")
    
    res.status(200).json({updatedUser})
} catch (error) {
    console.error("error in updating profile",error);
    return res.status(500).json({message:"Internal server error"})
}
}
export { signup, login, logout,updateProfile }