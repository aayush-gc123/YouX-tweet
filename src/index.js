
import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config()

connectDB()
.then(() => {
app.listen(process.env.PORT || 8000 , () => {
    console.log(`Server is running at port : ${process.env.PORT}`)
})
})
.catch((error) => {
    console.log("Mongo db connection failed" , error)
})



























// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// import express from "express";
// const app = express()


// (async () => {
// try {
// await mongoose.connect(`${process.env.MongoDB_URL}/${DB_NAME}`)
// app.on("error" , (error) => {
//     console.log("Error:" , error)
//     throw error
// })

// app.listen(process.env.PORT , () => {
//     console.log("App is lisyenning in port " , process.env.PORT)
// })
// } catch (error) {
//     console.error("Error:",error)
//     throw err
// }
// })()