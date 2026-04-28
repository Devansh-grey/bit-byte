import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../store/ChatStore.js';
import { formatTime } from '../utils/formatTime.js';

// Shows only HH:MM inside message bubbles, e.g. "09:41"
const formatMessageTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
import Avatar from './Avatar.jsx';
import { useAuthStore } from '../store/AuthStore.js';
import { getSocket } from '../utils/socket.js';

const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp"
const MAX_SIZE_MB = 5

// ─── Date separator helpers ───────────────────────────────────────────────────
function getDateLabel(dateStr) {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()

    if (isSameDay(date, today)) return "TODAY"
    if (isSameDay(date, yesterday)) return "YESTERDAY"

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    }).toUpperCase()
}

function getDayKey(dateStr) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Groups messages and injects { type: "separator", label, key } entries
function groupMessagesByDay(messages) {
    const result = []
    let lastKey = null
    for (const msg of messages) {
        const key = getDayKey(msg.createdAt)
        if (key !== lastKey) {
            result.push({ type: "separator", label: getDateLabel(msg.createdAt), key })
            lastKey = key
        }
        result.push({ type: "message", data: msg })
    }
    return result
}

const MessageArea = () => {
    const [text, setText] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageBase64, setImageBase64] = useState(null)
    const [imageError, setImageError] = useState("")
    const [deletingId, setDeletingId] = useState(null)       // tracks in-flight delete
    const [confirmDeleteId, setConfirmDeleteId] = useState(null) // confirm popover

    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    const {
        selectedChat,
        fetchMessages,
        messages,
        sendMessage,
        deleteMessage,
        isLoadingMessages,
        subscribeToMessages,
        unsubscribeFromMessages,
        typingUsers
    } = useChatStore()

    const { authUser, onlineUsers } = useAuthStore()
    const socket = getSocket()

    const chatId = selectedChat?._id

    const otherUser = selectedChat?.participants?.find(
        (p) => p._id !== authUser?._id
    )
    const isOnline = onlineUsers.includes(otherUser?._id)
    const isOtherTyping = typingUsers[chatId]?.has(otherUser?._id) ?? false

    // ─── Typing handler ───────────────────────────────────────────────
    const handleTyping = useCallback((e) => {
        setText(e.target.value)

        if (!socket || !chatId) return

        socket.emit("typing", chatId)

        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", chatId)
        }, 1500)
    }, [socket, chatId])

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => clearTimeout(typingTimeoutRef.current)
    }, [])

    // ─── Chat switch: fetch messages + join room + subscribe ──────────
    useEffect(() => {
        if (!chatId) return

        unsubscribeFromMessages()
        fetchMessages(chatId)
        socket?.emit("joinChat", chatId)
        subscribeToMessages()

        return () => {
            socket?.emit("leaveChat", chatId)
            unsubscribeFromMessages()
        }
    }, [chatId])

    // ─── Socket: messageDeleted ───────────────────────────────────────
    useEffect(() => {
        if (!socket) return

        const handleMessageDeleted = ({ messageId }) => {
            useChatStore.setState((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId)
            }))
            // Dismiss confirm popover if the message was deleted by sender elsewhere
            setConfirmDeleteId((prev) => (prev === messageId ? null : prev))
        }

        socket.on("messageDeleted", handleMessageDeleted)
        return () => socket.off("messageDeleted", handleMessageDeleted)
    }, [socket])

    // ─── Auto-scroll on new messages ──────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // ─── File handling ────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setImageError("")

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setImageError(`Image must be under ${MAX_SIZE_MB}MB`)
            e.target.value = ""
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
            setImageBase64(reader.result)
        }
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const clearImage = () => {
        setImagePreview(null)
        setImageBase64(null)
        setImageError("")
    }

    // ─── Send ─────────────────────────────────────────────────────────
    const handleSend = async () => {
        const hasText = text.trim().length > 0
        const hasImage = !!imageBase64

        if ((!hasText && !hasImage) || isSending) return

        clearTimeout(typingTimeoutRef.current)
        socket?.emit("stopTyping", chatId)

        setIsSending(true)
        try {
            await sendMessage({
                chatId,
                text: hasText ? text.trim() : undefined,
                media: hasImage ? imageBase64 : undefined,
            })
            setText("")
            clearImage()
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // ─── Delete ───────────────────────────────────────────────────────
    const handleDeleteConfirm = async (messageId) => {
        setDeletingId(messageId)
        setConfirmDeleteId(null)
        try {
            await deleteMessage(messageId)
            // Optimistic removal — socket echo also fires but deduplication is harmless
            useChatStore.setState((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId)
            }))
        } catch (err) {
            console.error("Delete failed", err)
        } finally {
            setDeletingId(null)
        }
    }

    const canSend = (text.trim().length > 0 || !!imageBase64) && !isSending

    // ─── Render ───────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full w-full bg-white font-mono text-black">

            {/* HEADER - Adjusted mobile padding (pl-20) to clear the hamburger menu */}
            <div className="h-20 flex items-center justify-between px-4 pl-20 md:px-8 md:pl-8 border-b-2 border-black bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar
                            name={otherUser?.fullName}
                            src={otherUser?.profilePic}
                            size={40}
                        />
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-black border-2 border-white rounded-full" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                            {otherUser?.fullName || "Unknown User"}
                        </h2>
                        {isOtherTyping ? (
                            <span className="text-[10px] font-mono text-black uppercase tracking-widest animate-pulse">
                                typing...
                            </span>
                        ) : (
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${
                                isOnline ? "text-black font-bold" : "text-gray-400"
                            }`}>
                                {isOnline ? "● ONLINE" : "● OFFLINE"}
                            </span>
                        )}
                    </div>
                </div>

                <button className="border-2 border-black px-4 py-1 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white">
                    [ INFO ]
                </button>
            </div>

            {/* MESSAGES AREA - Reduced p-8 to p-4, reduced gap-6 to gap-3 */}
            <div
                className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-3 bg-gray-50 custom-scrollbar"
                onClick={() => setConfirmDeleteId(null)} 
            >

                {isLoadingMessages && (
                    <div className="flex justify-center py-4">
                        <span className="text-xs text-gray-400 uppercase tracking-widest animate-pulse">
                            Loading messages...
                        </span>
                    </div>
                )}

                {!isLoadingMessages && messages.length === 0 && (
                    <div className="flex justify-center py-4">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">
                            No messages yet. Say hello!
                        </span>
                    </div>
                )}

                {groupMessagesByDay(messages).map((item) => {
                    if (item.type === "separator") {
                        return (
                            <div key={item.key} className="flex items-center justify-center">
                                <span className="text-[10px] font-bold bg-black text-white px-3 py-1 uppercase tracking-widest">
                                    {item.label}
                                </span>
                            </div>
                        )
                    }

                    const message = item.data
                    const isSelf = message.sender._id === authUser._id
                    const isDeleting = deletingId === message._id
                    const showConfirm = confirmDeleteId === message._id

                    return (
                        <div key={message._id}>
                            {isSelf ? (
                                // ── Own message (right-aligned) ──────────────
                                <div className="flex flex-col items-end w-full">
                                    <div
                                        className={`group relative max-w-[85%] md:max-w-[75%] ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        <button
                                            onClick={() => setConfirmDeleteId(showConfirm ? null : message._id)}
                                            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                            title="Delete message"
                                            disabled={isDeleting}
                                        >
                                            <span className="material-symbols-outlined text-base leading-none">
                                                delete
                                            </span>
                                        </button>

                                        {showConfirm && (
                                            <div className="absolute -left-48 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2 flex items-center gap-2 whitespace-nowrap">
                                                <span className="text-[10px] font-bold uppercase">Delete?</span>
                                                <button
                                                    onClick={() => handleDeleteConfirm(message._id)}
                                                    className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 hover:bg-red-600"
                                                >
                                                    YES
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="text-[10px] font-black uppercase border border-black px-2 py-0.5 hover:bg-gray-100"
                                                >
                                                    NO
                                                </button>
                                            </div>
                                        )}

                                        <div className="bg-white border-2 border-black px-2 py-1 text-sm leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            {isDeleting && (
                                                <span className="text-[10px] text-gray-400 uppercase animate-pulse block mb-1">
                                                    Deleting...
                                                </span>
                                            )}
                                            {message.media && (
                                                <img
                                                    src={message.media}
                                                    alt="media"
                                                    className="max-w-full mb-2 border border-black cursor-pointer"
                                                    onClick={() => window.open(message.media, "_blank")}
                                                />
                                            )}
                                            {message.text && (
                                                <p className="">{message.text}</p>
                                            )}
                                            <span className="block text-right text-[10px] font-bold text-gray-400 uppercase ">
                                                {formatMessageTime(message.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // ── Other user's message (left-aligned) ──────
                                <div className="flex flex-col items-start w-full">
                                    {/* Reduced p-4 to px-4 py-2 */}
                                    <div className="relative bg-white border-2 border-black px-4 py-2 text-sm leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[85%] md:max-w-[75%]">
                                        {message.media && (
                                            <img
                                                src={message.media}
                                                alt="media"
                                                className="max-w-full mb-2 border border-black cursor-pointer"
                                                onClick={() => window.open(message.media, "_blank")}
                                            />
                                        )}
                                        {message.text && (
                                            <p className="">{message.text}</p>
                                        )}
                                        <span className="block text-right text-[10px] font-bold text-gray-400 uppercase mt-1">
                                            {formatMessageTime(message.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="shrink-0 bg-gray-50 border-t-2 border-black">

                {/* Typing indicator */}
                {isOtherTyping && (
                    <div className="px-6 py-2 flex items-center gap-2 border-b border-gray-200">
                        <div className="flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase">
                            {otherUser?.fullName} is typing
                        </span>
                    </div>
                )}

                {/* Image preview strip */}
                {imagePreview && (
                    <div className="px-6 pt-4 flex items-start gap-3">
                        <div className="relative inline-block border-2 border-black">
                            <img
                                src={imagePreview}
                                alt="preview"
                                className="h-20 w-auto object-cover block"
                            />
                            <button
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs flex items-center justify-center hover:bg-gray-700"
                                title="Remove image"
                            >
                                ✕
                            </button>
                        </div>
                        {isSending && (
                            <span className="text-[10px] font-mono text-gray-400 uppercase animate-pulse self-end pb-1">
                                Uploading...
                            </span>
                        )}
                    </div>
                )}

                {/* Error */}
                {imageError && (
                    <p className="px-6 pt-2 text-xs text-red-500 font-mono uppercase">{imageError}</p>
                )}

                {/* Input row */}
                <div className="p-6 flex items-center">
                    <div className="flex w-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept={ACCEPTED_TYPES}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="flex-1 flex items-center bg-gray-50">
                            <input
                                value={text}
                                onChange={handleTyping}
                                onKeyDown={handleKeyDown}
                                type="text"
                                placeholder={imagePreview ? "ADD A CAPTION..." : "TYPE YOUR MESSAGE HERE..."}
                                className="w-full px-4 py-4 outline-none placeholder-gray-500 text-black font-bold text-sm bg-transparent"
                                disabled={isSending}
                            />
                            <div className="flex gap-3 px-4 text-gray-500 shrink-0">
                                <span
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`material-symbols-outlined cursor-pointer hover:text-black transition-colors ${imagePreview ? "text-black" : ""}`}
                                    title="Attach image"
                                >
                                    attach_file
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!canSend}
                            className="w-24 bg-black text-white font-black text-xs border-l-2 border-black flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSending ? "..." : "SEND"}
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}
// done
export default MessageArea