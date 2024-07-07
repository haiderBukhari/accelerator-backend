import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import AuthenticationRoutes from "./routes/AuthenticationRoutes/index.js";

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth', AuthenticationRoutes)

app.get('*', (req, res)=>{
    res.send('Server is connected successfully');
})

export default app;