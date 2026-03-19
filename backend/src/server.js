import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/userRoute.js';
import { connectDB } from './utils/db.js';
import { ENV } from './utils/env.js';

const app = express();
const port = Number(ENV.PORT ?? 5000);

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("express working");
});

// start server AFTER setup
(async () => {
    try {
        await connectDB();
        console.log("DB connected");

        app.listen(port, () => {
            console.log(`server running on port ${port}`);
        });
    } catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
})();