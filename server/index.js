import app from "../index.js";
import { config } from "dotenv";
import { connectDB } from "../db/connectDB.js";

config();
const PORT = process.env.PORT || 4000;

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch(()=>{
    console.error("Failed to connect to MongoDB");
    process.exit(1);
})