import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    participants:[
        {type:mongoose.Schema.Types.ObjectId,ref:"User"}
    ],
    lastmessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    isGroupChat: { type: Boolean, default: false }
    
},{timestamps:true})

// chatSchema.index(
//   { participants: 1 },
//   { unique: true, partialFilterExpression: { isGroupChat: false } }
// )
chatSchema.index({ participants: 1 })

const Chat =  mongoose.models.Chat ||  mongoose.model("Chat",chatSchema)

export default Chat