import { create } from 'zustand'
import axiosInstance from '../utils/axios.js'
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket.js'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    checkAuth: async () => {
        set({ isCheckingAuth: true })
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            connectSocket()  // ← no userId arg needed
            const socket = getSocket()
            socket?.on("onlineUsers", (users) => {   // ← matches server emit name
                get().setOnlineUsers(users)
            })
        } catch {
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            connectSocket()
            const socket = getSocket()
            socket?.on("onlineUsers", (users) => get().setOnlineUsers(users))
            return res.data
        } catch (error) {
            throw error
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            connectSocket()  // ← no userId arg
            const socket = getSocket()
            socket?.on("onlineUsers", (users) => get().setOnlineUsers(users))
            return res.data
        } catch (error) {
            throw error
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout')
        } catch (error) {
            throw error
        } finally {
            set({ authUser: null, onlineUsers: [] })
            disconnectSocket()
        }
    }
}))