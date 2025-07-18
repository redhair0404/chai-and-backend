import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

dotenv.config()



const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected successfully!! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`Failed Connecting  Database ERROR: ${error}`)
        process.exit(1)
    }
}

export default connectDB