import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { app, server } from './utils/socket.js' 
import authRoutes from './routes/authRoute.js'
import { connectDB } from './utils/db.js'
import { ENV } from './utils/env.js'
import chatRoutes from './routes/chatRoute.js'
import userRoutes from './routes/userRoute.js'
import messageRoutes from './routes/messageRoute.js'

const port = Number(ENV.PORT ?? 5000)
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/message', messageRoutes)


; (async () => {
    try {
        await connectDB()
        server.listen(port, () => console.log(`Server running on port ${port}`))  // ← server not app
    } catch (err) {
        console.error("Startup failed:", err)
        process.exit(1)
    }
})()