import asyncHandler from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import ApiError from '../utils/ApiError.js'
import { ApiResponse } from '../utils/Apiresponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'



const generateRefreshandAccessToken = async (userId) => {

    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken(userId)
        const refreshToken = await user.generateRefreshToken(userId)

        //give this refresh token to the user model
        user.refreshToken = refreshToken

        //mongoose provide a .save() method to save the data in the db, also while savinga field, other fileds kickin and try to get updated but since we haven't taken them here so to ignore use .save( { validateBeforeSave: false })
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while genertaing access and refresh token')
    }
}


const registerUser = asyncHandler(async (req, res) => {

    //Registration controller logic algo
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
    const { userName, email, fullName, password } = req.body


    //2. Validate the credentials 

    // if(userName === "" || email === "" || fullName === "" || password === "" ) return res.status(404).json({
    //     "message": "All fields are required"
    // })


    //Instead of this, use .some() array method to check the validation ---- The some() method returns true (and stops) if the function returns true for one of the array elements.


    if ([userName, email, fullName, password].some((fields) => fields?.trim() === "")) throw new ApiError(400, "All fields are required")


    //3.  Here we can check the user by either its username or email since both are unique but we want to check both
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]           //To check the more than one field we use $or --- $or: [{field1}, {field2}]      
    })


    if (existedUser) throw new ApiError(409, "User with the email and username already exist!")


    //4. check for the image and avatar if there are available

    // const avatarLocalPath = req.files?.avatar[0]?.path  //since we have an upload middleware it gives us  access to the req.files, but in case if we have no acccess to the req.files it is better to check with optional chaning - req.files?. 
    // since the avatar is an array with only one object which has path property so in order to use path property we do avatar[0]- the first object

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }



    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) throw new ApiError(400, 'Avatar File is required!')

    //5. Upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)



    if (!avatar) throw new ApiError(400, 'Avatar File is required!')

    //6. Create the user entry in db

    const user = await User.create({
        fullName,
        userName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""

    })

    //7. Remove the password and refresh token fromt he payload

    const createdUser = await User.findById(user._id).select(   //.select( ) this method is used to  remove a field from the db entry .select( "-field1 -field2") -filed means remove it
        " -password -refreshToken"
    )

    //8 check if the user iis created or not

    if (!createdUser) throw new ApiError(500, " Something went wrong")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {

    
    //Login controller logic algo
    //1. Get user credentials
    //2. Validate if the email or username is correct or not empty
    //3. Check if user is there in the DB 
    //4. Check if the password is correct
    //5. Generate the  refresh and access token
    //6. send to cookie
    //7. give success response


    //1. Get user credentials
    const { userName, email, password } = req.body

    console.log(req.body.email)
    //2. Validate if the email or username is correct or not empty
    if (!(userName || !email)) throw new ApiError(400, 'Username or Email required!')


    //3. Check if user is there in the DB 
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) throw new ApiError(404, 'User does not exist')


    //4. Check if the password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(404, 'Invalid User password!')


    //5. Generate the  refresh and access token
    const { accessToken, refreshToken } = await generateRefreshandAccessToken(user._id)



    //since 'user' from before has no refresh token because we have just generated it so we need to create a new loggedinUser and  we dont want to give the  refresh token and password to the user

    const loggedinUser = await User.findById(user._id).select(" -password -refreshToken")

    //6. send to cookie
    const cookieOption = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie('accessToken', accessToken, cookieOption)
        .cookie('refreshToken', refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser, accessToken, refreshToken //Even tho we have passed the accessToken and refreshToken in the cookie, still we are giving it in json response because the user may use it to store it in localstorage or may be it is using for the mobile so it can not access it via cookie so this is for them
                },
                'User Logged In Successfully!!'
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: "" }
        },
        {
            new: true  // adding new so that only the new value come after updatation not the old one
        }
    )

    const cookieOption = {
        httpOnly: true,
        secure: true
    }

   return res
    .status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}