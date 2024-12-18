import express from "express"
import cron from "node-cron";
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
import groupRoutes from "./routes/groupRoutes.js";
import NotificationRoutes from "./routes/NotificationRoute.js";
import groupFolderRoutes from "./routes/groupFolderRoutes.js";
import { NotificationsModel } from "./models/notificationModel.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import QuizRoutes from "./routes/quizRoutes.js";
import QuizSolutionRoutes from "./routes/quizSolutionRoutes.js";
import NotesRouter from "./routes/NotesRoutes.js";
import { modulesModel } from "./models/moduleModel.js";
import { uploadModuleEmail } from "./utils/ModuleUpload.js";
import embeddingRouter from "./routes/EmbeddingRoutes.js";

config();
const app = express();
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
const server = http.createServer(app);

app.use(express.json());
app.use(morgan('dev'));
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
app.use('/api/payment', PaymentRoutes)
app.use(verifyToken)
app.use('/api/post', PostsRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/groups-folders', groupFolderRoutes)
app.use('/api/notification', NotificationRoutes)
app.use('/api/quiz/solution', QuizSolutionRoutes)
app.use('/api/quiz', QuizRoutes)
app.use('/api/notes', NotesRouter)
app.use('/api/embedded-html', embeddingRouter)
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

        socket.on('send_message', async ({ message, id }) => {
            console.log(`message received from ${data.firstName} ${message}`);

            const data1 = await AuthenticationModel.findById(id);
            const newMessage = new MessagesModel({
                senderId: data._id,
                receiverId: id,
                message: message,
                status: data1.socketId ? "read" : "delivered"
            });

            await newMessage.save();

            await NotificationsModel.create({
                userId: id,
                message: `${data.firstName} ${data.lastName} sent you a message`,
                createdAt: new Date()
            });

            io.to(data1.socketId).emit('recieve_message', { message, status: 'delivered' });
            io.to(data.socketId).emit('recieve_message', { message, status: 'delivered' });
        });

        socket.on('message_read', async ({userId}) => {
            console.log("userId", userId)
            const messages = await MessagesModel.find({receiverId: userId, status: "delivered" });

            messages.forEach(async (message) => {
                if (message.status === 'read') {
                } else {
                    message.status = 'read';
                    await message.save();
                }
            })
        });
        socket.on('disconnect', async () => {
            console.log("User Disconnected ", socket.id);
            if (data) {
                data.socketId = null;
                await data.save();
            }
        });
    });
});

const isUnlockable = (createdAt, unLockDays) => {
    const userJoinDate = new Date(createdAt);
    userJoinDate.setHours(0, 0, 0, 0);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const daysSinceJoining = Math.floor((currentDate - userJoinDate) / (1000 * 60 * 60 * 24));
    return daysSinceJoining == unLockDays;
};

// Cron job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
    console.log("Running daily unlock check...");

    try {
        const users = await AuthenticationModel.find({}, "firstName email createdAt");
        if (!users || users.length === 0) {
            console.log("No users found.");
            return;
        }

        for (const user of users) {
            if (!user.createdAt) continue;

            const modules = await modulesModel.find({}, "name unLockDays");
            if (!modules || modules.length === 0) {
                console.log("No modules found.");
                return;
            }

            for (const module of modules) {
                if (isUnlockable(user.createdAt, module.unLockDays)) {
                    await uploadModuleEmail(user.email, user.firstName, module.name);
                }
            }
        }
    } catch (error) {
        console.error("Error running cron job:", error.message);
    }
});

app.get('*', (req, res) => {
    res.send('Server is connected successfully');
})

export default server;