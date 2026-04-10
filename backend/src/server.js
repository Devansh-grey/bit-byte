import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/authRoute.js'
import { connectDB } from './utils/db.js'
import { ENV } from './utils/env.js'
import chatRoutes from './routes/chatRoute.js'
import userRoutes from './routes/userRoute.js'
import messageRoutes from './routes/messageRoute.js'

const app = express()
const port = Number(ENV.PORT ?? 5000)
// const __dirname = path.resolve()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Middleware
app.use(express.json())
app.use(cookieParser())


app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true  // Required so cookies are sent cross-origin
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/message', messageRoutes)

// Health check
app.get('/', (req, res) => {
    res.send("express working")
})

// Production static file serving
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../frontend/dist")))

    app.get("/{*path}", (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"))
    })
}

// Start server after DB connects
; (async () => {
    try {
        await connectDB()
        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (err) {
        console.error("Startup failed:", err)
        process.exit(1)
    }
})()