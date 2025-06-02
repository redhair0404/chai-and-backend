import mongoose, {Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "Fullname is required"],
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String,  //From Cloudinary URL
        required: true
    },
    coverImage: {
        type: String  //From Cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    refreshToken: {
        type: String
    }
}, { timestamps: true})


//Middleware to hash the password-- here we are using bcrypt for hashing
userSchema.pre('save', async function(next){
    const user = this

    if(!user.isModified("password")) return next()
    
    user.password = await bcrypt.hash(user.password, 10)  //user.password is some gibbereish string as it has ben hashed
    next()
})


//Middlerware/ method to check if the given password matches the og passwowrd or is correct using bcrypt
userSchema.methods.isPasswordCorrect = async function (password) {
    const user = this
    return await bcrypt.compare(password, user.password) 
}


//Method to generate the Access token by JWT
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {                                   //THE USER PAYLOAD
            _id: this._id,           
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        }, 
            process.env.ACCESS_TOKEN_SECRET,   // THE SECRET KEY
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY  //expiry time of the access token
        }
    )
}


//Method to generate the Refresh token by JWT
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {                                   //THE USER PAYLOAD
            _id: this._id,           
        }, 
            process.env.REFRESH_TOKEN_SECRET,   // THE SECRET KEY
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY  //expiry time of the refresh token
        }
    )
}


export const User = mongoose.model('User', userSchema)