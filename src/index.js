import dotenv from 'dotenv'
import connectDB from './db/db.js'
import {app} from './app.js'

dotenv.config({
    path: './env'
})


const port = process.env.PORT || 8000

connectDB()
.then(() => {
    app.on('error', (err) => {
        console.log(`Connection err ${err}`)
        throw new Error
    })

    app.listen(port, () => console.log(`⚙️ Server is running at port : ${port}`))
})
.catch((err) => console.log(`Error connecting database ERROR:${err}`))





//This is also another production way using IIFE

/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/