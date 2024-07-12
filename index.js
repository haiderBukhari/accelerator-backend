import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import AuthenticationRoutes from "./routes/AuthenticationRoutes.js";
import cors from "cors"
import OtpRoutes from "./routes/SendOtpRoutes.js";
import { config } from "dotenv";
import PostsRoutes from "./routes/PostsRoutes.js";
import { verifyToken } from "./utils/verifyJWT.js";

config();
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
    origin: ["http://localhost:5173", "https://accelerator-five.vercel.app"],
    credentials: true
}));

app.use('/api/auth', AuthenticationRoutes)
app.use('/api/otp', OtpRoutes)
app.use('/api/post', verifyToken, PostsRoutes)

app.get('*', (req, res)=>{
    res.send('Server is connected successfully');
})

export default app;