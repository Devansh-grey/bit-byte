import jwt from 'jsonwebtoken'
import { ENV } from '../utils/env.js'

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

export {createToken}

