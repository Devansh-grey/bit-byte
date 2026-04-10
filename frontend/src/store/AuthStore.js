import { create } from 'zustand'
import axiosInstance from '../utils/axios.js'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        set({isCheckingAuth:true})
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
         try {
            await axiosInstance.post('/auth/logout')
        } catch (error) {
            console.error("Logout failed:", error)
            throw error
        } finally {
            set({ authUser: null, onlineUsers: [] })
        }
    }
}))