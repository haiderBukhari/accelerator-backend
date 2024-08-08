import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import AuthenticationRoutes from "./routes/AuthenticationRoutes.js";
import cors from "cors"
import OtpRoutes from "./routes/SendOtpRoutes.js";
import { config } from "dotenv";
import PostsRoutes from "./routes/PostsRoutes.js";
import { verifyToken } from "./utils/verifyJWT.js";
import friendRoutes from "./routes/friendRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import { Server } from "socket.io";
import http from 'http'
import { getAllMessages } from "./controller/MessagesController.js";
import jwt from 'jsonwebtoken'
import { AuthenticationModel } from "./models/AuthenticationModel.js";
import { MessagesModel } from "./models/MessageModel.js";

config();
const app = express();
const server = http.createServer(app);

app.use(express.json());
// app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
    origin: ["http://localhost:5173", "https://accelerator-five.vercel.app"],
}));

const io = new Server(server, {
    cors: {
        origin: "*",
    },
    allowEIO3: true,
});


app.use('/api/auth', AuthenticationRoutes)
app.use('/api/otp', OtpRoutes)
app.use(verifyToken)
app.use('/api/post', PostsRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/events', eventsRoutes)
app.get('/api/messages', getAllMessages)


io.on('connection', (socket) => {
    const token = socket.handshake.query.token;
    if (!token) {
        console.error('No token provided');
        socket.disconnect();
        return;
    }

    jwt.verify(token, process.env.COOKIE_SECRET, async (err, decoded) => {
        if (err) {
            console.error('Token verification failed', err);
            socket.disconnect();
            return;
        }

        const data = await AuthenticationModel.findById(decoded.id);
        data.socketId = socket.id;
        await data.save();

        console.log(`User Connected with UserId of ${decoded.id}, socket.id: ${socket.id}`);
        
        socket.on('connect_error', (err) => {
            console.error("Connection Error: ", err.message);
        });

        socket.on('send_message', async ({message, id}) => {
            const data1 = await AuthenticationModel.findById(id);
            const newMessage = new MessagesModel({
                senderId: data._id,
                receiverId: id,
                message: message
            });
            await newMessage.save();    
            io.to(data1.socketId).emit('recieve_message', message);
        });

        socket.on('disconnect', () => {
            console.log("User Disconnected ", socket.id);
        });
    });
});

app.get('*', (req, res) => {
    res.send('Server is connected successfully');
})

export default server;