import User from "../models/User.js"
import bcrypt from 'bcrypt'
import { createToken } from "../middleware/auth.js"
import { sendWelcomeEmail } from "../email/emailHandler.js"
import { ENV } from "../utils/env.js"

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
        const hashedPassword = await bcrypt.hash(password,salt)

        // creating new user
        const user = new User({
            fullName,
            email,
            password:hashedPassword
        })
        const saveduser = await user.save()
        createToken(saveduser._id,res)
        
        res.status(201).json({
            success:true,
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })

        // sending welcome email 
        try {
            await sendWelcomeEmail(saveduser.email,saveduser.fullName,ENV.CLIENT_URL)
        } catch (error) {
            console.error("Failed to send welcome email",error);
            
        }


    } catch (error) {
        console.log("error in auth Controller",error.message);
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

export { signup }