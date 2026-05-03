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
            connectSocket() 
            const socket = getSocket()
            socket?.on("onlineUsers", (users) => {  
                get().setOnlineUsers(users)
            })
        } catch {
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
         const res = await axiosInstance.post("/auth/signup", data)
        return res.data
    },
    resendVerification: async (email) => {
        const res = await axiosInstance.post("/auth/resend-verification", { email })
        return res.data
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            connectSocket() 
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