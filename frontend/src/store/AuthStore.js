import { create } from 'zustand'
import axiosInstance from '../utils/axios.js'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
        } catch (error) {
            console.error("Auth check failed:", error)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        try {
            
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            return res.data
        } catch (error) {
            console.error(error)
            throw error
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            return res.data
        } catch (error) {
            console.error(error)
            throw error
        }
    },

    logout: async () => {
        await axiosInstance.post('/auth/logout')
        set({ authUser: null, onlineUsers: [] })
    }
}))