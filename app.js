import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"

config({
    path:"./Config/config.env",
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true,
}));
app.use(cookieParser());

app.use(cors({
    origin: [process.env.FRONTEND_URL , "http://localhost:3000"],
    credentials: true,
}));

import course from "./Routes/courseRoutes.js"
import user from "./Routes/userRoutes.js"
import payment from "./Routes/paymentRoutes.js"
import other from "./Routes/otherRoutes.js"
app.use("/api/v1",course); 
app.use("/api/v1",user);
app.use("/api/v1",payment);
app.use("/api/v1",other);

import { ErrorMiddleware } from "./Middleware/error.js";
app.use(ErrorMiddleware);

export default app;