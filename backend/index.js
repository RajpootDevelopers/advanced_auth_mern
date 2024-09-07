import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";


dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const __dirname = path.resolve();
const allowedOrigins = [
    'https://advanced-auth-mern-dyw1-7gcu12mim-afaq-ahmads-projects-571f8223.vercel.app',
    'https://advanced-auth-mern-dyw1.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // If you need to send cookies or authentication tokens
}));

// app.use(cors({ origin: "*", credentials: true }))
app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRoutes)

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://advanced-auth-mern-dyw1.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// if(process.env.NODE_ENV === "production"){
//     app.use(express.static(path.join(__dirname, "/frontend/dist")));
//     app.get("*", (req, res)=>{
//         res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
//     })
// }


app.listen(PORT, () =>{
    connectDB()
    console.log(`server is listening on port ${PORT}`)
})
