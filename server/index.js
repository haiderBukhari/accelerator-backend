import server from "../index.js";
import { connectDB } from "../db/connectDB.js";

const PORT = process.env.PORT || 4000;

connectDB().then(()=>{
    server.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch(()=>{
    console.error("Failed to connect to MongoDB");
    process.exit(1);
})