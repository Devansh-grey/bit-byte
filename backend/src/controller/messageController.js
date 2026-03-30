import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import cloudinary from "../utils/cloudinary.js";

export const sendMessage = async (req, res) => {
    try {

        const { chatId, text, media } = req.body

        if (!chatId || (!text && !media)) {
            return res.status(400).json({
                success: false,
                message: "chatId and message content required",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId",
            })
        }
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        })

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or not authorized",
            })
        }

        let mediaUrl
        if (media) {
            const uploadResponse = await cloudinary.uploader.upload(media)
            mediaUrl = uploadResponse.secure_url
        }

        const message = await Message.create({
            sender: req.user._id,
            chat: chatId,
            text: text?.trim(),
            media: media ? mediaUrl : null,
            seenBy: [req.user._id]
        })

        const fullMessage = await Message.findById(message._id)
            .populate("sender", "fullName profilePic")
            .populate("chat")

        chat.lastmessage = message._id
        await chat.save()

        res.status(201).json({
            success: true,
            data: fullMessage,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId",
            })
        }

        const chatExists = await Chat.exists({
            _id: chatId,
            participants: req.user._id
        })

        if (!chatExists) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or not authorized",
            })
        }


        let page = Math.max(1, parseInt(req.query.page) || 1)
        let limit = Math.min(50, parseInt(req.query.limit) || 30)
        const skip = (page - 1) * limit

        const [messages, total] = await Promise.all([
            Message.find({ chat: chatId })
                .populate('sender', 'fullName profilePic')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Message.countDocuments({ chat: chatId })
        ])

        res.status(200).json({
            success: true,
            data: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const markAsSeen = async (req, res) => {
    try {

        const { chatId } = req.params

        await Message.updateMany(
            { chat: chatId, seenBy: { $ne: req.user._id } },
            { $addToSet: { seenBy: req.user._id } }
        )
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid messageId",
            })
        }

        const message = await Message.findOne({
            _id: messageId,
            sender: req.user._id
        })

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found or not authorized",
            });
        }

        const chatId = message.chat

        await message.deleteOne()

        const chat = await Chat.findById(chatId)

        if (chat && chat.lastmessage?.toString() === messageId) {
            const lastmessage = await Message.findOne({ chat: chatId }).sort({ createdAt: -1 })
            chat.lastmessage = lastmessage ? lastmessage._id : null
            await chat.save()
        }

        res.status(200).json({
            success: true,
            message: "Message deleted",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}