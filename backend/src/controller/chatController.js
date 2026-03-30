import Chat from "../models/Chat.js";

export const accessChat = async (req, res) => {

    try {
        const { userId } = req.body
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId required"
            });
        }

        let chat = await Chat.findOne({
            isGroupChat: false,
            participants: { $all: [req.user._id, userId] }
        })
            .populate("participants", "-password")
            .populate("lastmessage")

        if (chat) {
            return res.status(200).json({
                success: true,
                data: chat
            });
        }

        // create new chat
        chat = await Chat.create({
            participants: [req.user._id, userId]
        })

        const fullChat = await Chat.findById(chat._id)
            .populate("participants", "-password");

        res.status(201).json({
            success: true,
            data: fullChat
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
            participants: {$in: [req.user._id]}
        })
        .populate("participants","-password")
        .populate({
            path: "lastmessage",
            populate:{
                path: "sender",
                select: "fullName profilePic"
            }
        })
        .sort({updatedAt:-1})

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
        const chat = await Chat.findById(req.params.chatId)
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
        await Chat.findByIdAndDelete(req.params.chatId);

        res.status(200).json({
            success: true,
            message: "Chat deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};