import { create } from "zustand"
import axiosInstance from "../utils/axios.js"
import { getSocket } from "../utils/socket.js"

export const useChatStore = create((set, get) => ({
    chats: [],
    selectedChat: null,
    contacts: [],
    isSearching: false,
    messages: [],
    isLoadingMessages: false,

    // key: chatId, value: Set of userIds currently typing in that chat
    typingUsers: {},

    setSelectedChat: (chat) => set({ selectedChat: chat }),

    subscribeToMessages: () => {
        const socket = getSocket()
        if (!socket) return

        socket.on("newMessage", (message) => {
            const { selectedChat } = get()
            const msgChatId = message.chat?._id ?? message.chat
            if (msgChatId !== selectedChat?._id) return
            set((state) => ({ messages: [...state.messages, message] }))
        })

        socket.on("chatUpdated", ({ chatId, lastmessage }) => {
            set((state) => ({
                chats: state.chats.map((c) =>
                    c._id === chatId ? { ...c, lastmessage } : c
                )
            }))
        })

        // ── Typing ────────────────────────────────────────────────────────────
        socket.on("typing", ({ chatId, userId }) => {
            set((state) => {
                const prev = new Set(state.typingUsers[chatId])
                prev.add(userId)
                return { typingUsers: { ...state.typingUsers, [chatId]: prev } }
            })
        })

        socket.on("stopTyping", ({ chatId, userId }) => {
            set((state) => {
                const prev = new Set(state.typingUsers[chatId])
                prev.delete(userId)
                return { typingUsers: { ...state.typingUsers, [chatId]: prev } }
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = getSocket()
        socket?.off("newMessage")
        socket?.off("chatUpdated")
        socket?.off("typing")
        socket?.off("stopTyping")
    },

    fetchChats: async () => {
        try {
            const res = await axiosInstance.get("/chats")
            const currentSelected = get().selectedChat
            set({
                chats: res.data.data,
                selectedChat: currentSelected
                    ? (res.data.data.find(c => c._id === currentSelected._id) ?? currentSelected)
                    : null
            })
        } catch (error) {
            console.error(error)
            throw error
        }
    },

    accessChat: async (userId) => {
        try {
            const res = await axiosInstance.post("/chats", { userId })
            if (!res.data?.data) throw new Error("Server returned no chat data")
            const chat = res.data.data
            set((state) => {
                const exists = state.chats.some((c) => c._id === chat._id)
                const updatedChats = exists
                    ? [chat, ...state.chats.filter((c) => c._id !== chat._id)]
                    : [chat, ...state.chats]
                return { chats: updatedChats, selectedChat: chat, contacts: [] }
            })
            return chat
        } catch (error) {
            console.error("[accessChat] failed:", error)
            throw error
        }
    },

    searchUsers: async (query) => {
        if (!query.trim()) { set({ contacts: [] }); return }
        try {
            set({ isSearching: true })
            const res = await axiosInstance.get(`/user/search?q=${query}`)
            set({ contacts: res.data.data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isSearching: false })
        }
    },

    fetchMessages: async (chatId) => {
        set({ messages: [], isLoadingMessages: true })
        try {
            const res = await axiosInstance.get(`/message/${chatId}`)
            set({ messages: res.data.data })
        } catch (error) {
            console.error("Failed to load messages", error)
        } finally {
            set({ isLoadingMessages: false })
        }
    },

    sendMessage: async ({ chatId, text, media }) => {
        try {
            await axiosInstance.post("/message", { chatId, text, media })
        } catch (error) {
            console.error("Failed to send message", error)
            throw error
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/message/${messageId}`)
            // do NOT remove here — socket "messageDeleted" echo handles it
            // so both sender and receiver see it disappear simultaneously
        } catch (error) {
            console.error("Failed to delete message", error)
            throw error
        }
    },
    
}))