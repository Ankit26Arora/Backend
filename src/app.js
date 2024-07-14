import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.Cors_origin
}));

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("Public"));
app.use(cookieParser());

import userRoute from './routes/userroute.js';

app.use("/api/v1/user", userRoute);

// Test route to check if server is working
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

export default app;
