import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    media: {
        type: String,
        default: ""
    },
    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });


messageSchema.pre("validate", async function () {
    if (!this.text?.trim() && !this.media?.trim()) {
        this.invalidate("text", "Message must contain text or media")
    }
})

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)

export default Message
