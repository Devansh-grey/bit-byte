import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_SOCKET_URL 

let socket = null

export const connectSocket = () => {
    if (socket?.connected) return

    socket = io(BASE_URL, {
        withCredentials: true,  // sends the jwt cookie — backend authenticates from it
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    })

    socket.on("connect", () => console.log("[socket] connected"))
    socket.on("connect_error", (err) => console.error("[socket] error:", err.message))
}

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect()
    }
    socket = null
}

export const getSocket = () => socket