import jwt from 'jsonwebtoken'
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        //extract the token from the cookie or authorization header
        // console.log(req.cookies,'all-cookie', req.cookies.accessToken, 'access-cookie')

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        
        if(!token) throw new ApiError(401, "Unauthorized request")

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken")

        if(!user) throw new ApiError(401, 'Invalid Access Token')
        req.user = user //create a "user" object in req

        next()

    } catch (error) {
        throw new ApiError(401, 'Invalid Token Access or No Token')
        // console.log(error)
    }
})