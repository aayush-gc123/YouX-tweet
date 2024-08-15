import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(urlencoded({ extended: true, limit: "16kb" })) //we can take object under object
app.use(express.static("public")) //every one can access any kind og photo pdf file 
app.use(cookieParser())


//routes import


import UserRoute from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js"

//http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", UserRoute)
app.use("/api/v1/tweets", tweetRouter)
export { app }
