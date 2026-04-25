import React, { useEffect } from "react"
import { useChatStore } from "../store/ChatStore.js"
import { useAuthStore } from "../store/AuthStore.js"
import Avatar from "../components/Avatar"

const Chats = () => {
    const { chats, selectedChat, fetchChats, setSelectedChat, typingUsers } = useChatStore()
    const { authUser, onlineUsers } = useAuthStore()

    const formatChatTime = (date) => {
        if (!date) return ""
        const d = new Date(date)
        const now = new Date()
        const diff = now - d
        const day = 1000 * 60 * 60 * 24
        if (diff < day) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        if (diff < day * 2) return "Yesterday"
        return d.toLocaleDateString()
    }

    const getLastMessagePreview = (message, authUser) => {
        if (!message) return "NO MESSAGES YET"
        const isYou = message.sender?._id === authUser._id
        const prefix = isYou ? "YOU: " : ""
        if (message.media && !message.text) return prefix + "📎 MEDIA"
        if (message.media && message.text) return prefix + "📎 " + message.text.toUpperCase()
        return prefix + message.text?.toUpperCase()
    }

    // Only fetch once on mount — NOT on every render
    useEffect(() => {
        fetchChats()
    }, [])

    return (
        <div className="flex-1 bg-gray-50 divide-y-2 divide-black border-b-2 border-black">
            {chats.length === 0 && (
                <div className="p-6 text-sm font-mono text-gray-500 uppercase">
                    NO CHATS FOUND
                </div>
            )}

            {chats.map((chat) => {
                if (!chat?.participants) return null

                const otherUser = chat.participants.find(
                    (p) => p?._id !== authUser?._id
                )
                const isOnline = onlineUsers.includes(otherUser?._id)
                const isTyping = typingUsers[chat._id]?.size > 0



                if (!otherUser) return null

                return (
                    <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className={`px-6 py-4 transition-all cursor-pointer group flex items-center gap-4
                        ${selectedChat?._id === chat._id
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                            }`}
                    >
                        <div className="relative shrink-0 border-2 border-transparent group-hover:border-white transition-all">
                            <Avatar
                                name={otherUser?.fullName}
                                src={otherUser?.profilePic}
                                size={40}
                            />
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-bold text-sm font-mono truncate">
                                    {otherUser?.fullName?.toUpperCase()}
                                </p>
                                <span className={`text-[10px] font-mono shrink-0 ml-2 ${selectedChat?._id === chat._id ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                    {formatChatTime(chat.lastmessage?.createdAt)}
                                </span>
                            </div>

                            <p className={`text-xs font-mono truncate uppercase ${selectedChat?._id === chat._id ? "text-gray-300" : "text-gray-600 group-hover:text-gray-300"
                                }`}>
                                {isTyping
                                    ? <span className={selectedChat ? "text-green-400" : "text-green-600"}>
                                        TYPING...
                                    </span>
                                    : getLastMessagePreview(chat.lastmessage, authUser)
                                }
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Chats