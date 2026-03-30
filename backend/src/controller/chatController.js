import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js"


export const accessChat = async (req, res) => {

    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId required"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId"
            })
        }
        const userExists = await User.exists({ _id: userId })

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const participants = [req.user._id.toString(), userId].sort()

        let chat

        try {

            chat = await Chat.findOneAndUpdate(
                {
                    isGroupChat: false,
                    participants
                },
                {
                    $setOnInsert: {
                        participants,
                        isGroupChat: false
                    }
                },
                {
                    new: true,
                    upsert: true
                }
            )
                .populate("participants", "-password")
                .populate("lastmessage")

        } catch (err) {
            if (err.code === 11000) {
                chat = await Chat.findOne({
                    isGroupChat: false,
                    participants
                })
                    .populate("participants", "-password")
                    .populate("lastmessage")
            } else {
                throw err
            }
        }


        res.status(201).json({
            success: true,
            data: chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export const getChats = async (req, res) => {

    try {
        const chats = await Chat.find({
            participants: { $in: [req.user._id] }
        })
            .populate("participants", "-password")
            .populate({
                path: "lastmessage",
                populate: {
                    path: "sender",
                    select: "fullName profilePic"
                }
            })
            .sort({ updatedAt: -1 })

        res.status(200).json({
            success: true,
            data: chats
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getChatById = async (req, res) => {
    try {

         if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId"
            });
        }
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        })
            .populate("participants", "-password")
            .populate("lastmessage");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        res.status(200).json({
            success: true,
            data: chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId"
            })
        }

        const chat = await Chat.findOneAndDelete({
            _id: chatId,
            participants: req.user._id
        })

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or not authorized"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Chat deleted"
        })

    } catch (error) {
        console.error("Error in deleteChat:", error.message)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}