import asyncHandler from '../utils/asyncHandler.js'
import {User} from '../models/user.models.js'
import ApiError from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'




const registerUser = asyncHandler( async (req, res) => {

    //1. Get the user details from the frontend
    //2. validate the credentials -- not an empty field
    //3. check if the user already exists
    //4. get (from the multer) and check for the image and avatar if there are available
    //5. upload them to cloudinary, avatar
    //6. create user object - create entry in db
    //7. remove the password and refreshToken field from the response
    //8. check if the user is created or not
    //9 return

    //1. Get the details
    const {userName, email, fullName, password, avatar, coverImage} = req.body


    //2. Validate the credentials 

    // if(userName === "" || email === "" || fullName === "" || password === "" ) return res.status(404).json({
    //     "message": "All fields are required"
    // })


    //Instead of this, use .some() array method to check the validation ---- The some() method returns true (and stops) if the function returns true for one of the array elements.


    if([userName, email, fullName, password].some((fields) => fields?.trim() === "" )) throw new ApiError(400, "All fields are required")


    //3.  Here we can check the user by either its username or email since both are unique but we want to check both
    const existedUser = await User.findOne({  
        $or: [{ userName }, { email }]           //To check the more than one field we use $or --- $or: [{field1}, {field2}]      
    })


    if(existedUser) throw ApiError(409, "User with the email and username already exist!")

    
    //4. check for the image and avatar if there are available

    const avatarLocalPath = req.files?.avatar[0]?.path  //since we have an upload middleware it gives us  access to the req.files, but in case if we have no acccess to the req.files it is better to check with optional chaning - req.files?. 
    // since the avatar is an array with only one object which has path property so in order to use path property we do avatar[0]- the first object

    const coverImageLocalPath = req.files?.coverImage[0]?.path


    if(!avatarLocalPath) throw new ApiError(400, 'Avatar File is required!') 

    //5. Upload on cloudinary
    const avataar = await uploadOnCloudinary(avatarLocalPath)
    const cover_Image = await uploadOnCloudinary(coverImageLocalPath)

    if(!avataar) throw new ApiError(400, 'Avatar File is required!') 

    //6. Create the user entry in db

    const user =  await User.create({
        fullName,
        userName: userName.lowercase(),
        email,
        password,
        avatar: avataar.url,
        coverImage: cover_Image?.url || ""
    })

    //7. Remove the password and refresh token fromt he payload

    const createdUser = await User.findById(user._id).select(   //.select( ) this method is used to  remove a field from the db entry .select( "-field1 -field2") -filed means remove it
        " -password -refreshToken"
    )

    //8 check if the user iis created or not

    if(!createdUser) throw new ApiError(500, " Something went wrong")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    
})


export {
    registerUser
}