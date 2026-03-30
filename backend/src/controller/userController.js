import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js"
import mongoose from "mongoose";

export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q?.trim()
        const escapedKeyword = keyword?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Search query required"
            });
        }

        const users = await User.find({
            $or: [
                { fullName: { $regex: escapedKeyword, $options: "i" } },
                // { username: { $regex: keyword, $options: "i" } },
                { email: { $regex: escapedKeyword, $options: "i" } }
            ],
            _id: { $ne: req.user._id }
        }).select("-password").limit(20)

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            });
        }
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullName,bio, username, profilePic } = req.body
        const user = await User.findById(req.user._id);
          if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (fullName) user.fullName = fullName;
        // if (username) user.username = username;
        if (bio !== undefined) user.bio = bio
        if (profilePic){
            const uploadResponse = await cloudinary.uploader.upload(profilePic)
            user.profilePic = uploadResponse.secure_url 
        };

        await user.save()

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                // username: user.username,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
