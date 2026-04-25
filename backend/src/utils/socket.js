import { Server } from "socket.io"
import http from "http"
import express from "express"
import { ENV } from "./env.js"
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1 MB — prevents oversized payload attacks
})

// JWT auth on every socket connection — no unauthenticated sockets allowed
io.use(socketAuthMiddleware)

// userId (string) -> Set<socketId>  supports multiple tabs per user
const userSocketMap = new Map()

export function getReceiverSocketId(userId) {
    const ids = userSocketMap.get(userId.toString())
    return ids ? [...ids][0] : null
}

function broadcastOnlineUsers() {
    io.emit("onlineUsers", Array.from(userSocketMap.keys()))
}

io.on("connection", (socket) => {
    const userId = socket.userId // injected by socketAuthMiddleware

    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set())
    userSocketMap.get(userId).add(socket.id)

    // Personal room so controllers can do io.to(userId).emit(...)
    socket.join(userId)

    broadcastOnlineUsers()
    console.log(`[socket] + ${socket.user.fullName} (${userId})`)

    socket.on("joinChat", (chatId) => {
        if (typeof chatId !== "string" || !chatId.trim()) return
        socket.join(chatId)
    })

    socket.on("leaveChat", (chatId) => {
        if (typeof chatId !== "string" || !chatId.trim()) return
        socket.leave(chatId)
    })

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on("typing", (chatId) => {
        if (typeof chatId !== "string" || !chatId.trim()) return
        // broadcast to everyone in the room EXCEPT the sender
        socket.to(chatId).emit("typing", { chatId, userId })
    })

    socket.on("stopTyping", (chatId) => {
        if (typeof chatId !== "string" || !chatId.trim()) return
        socket.to(chatId).emit("stopTyping", { chatId, userId })
    })

    socket.on("disconnect", () => {
        const sockets = userSocketMap.get(userId)
        if (sockets) {
            sockets.delete(socket.id)
            if (sockets.size === 0) userSocketMap.delete(userId)
        }
        broadcastOnlineUsers()
        
    })
})

export { io, app, server }