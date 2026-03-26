import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path'

import authRoutes from './routes/userRoute.js';
import { connectDB } from './utils/db.js';
import { ENV } from './utils/env.js';

const app = express();
const port = Number(ENV.PORT ?? 5000);
const __dirname = path.resolve()

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.send("express working");
});

// for deployment
if(process.env.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*path}",(req,res) =>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
    })
}

// start server AFTER setup
(async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`server running on port ${port}`);
        });
    } catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
})();