import express from 'express'
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword,
    updateUserAccount, updateUserAvatar,updateUserCoverImage } from '../controllers/user.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/registerUser').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
]), registerUser)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(verifyToken, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/get-currentuser').get(verifyToken, getCurrentUser)
router.route('/update-user-account').post(verifyToken, updateUserAccount)
router.route('/update-avatar').post(upload.single('avatar') ,verifyToken, updateUserAvatar)
router.route('/update-coverimage').post(upload.single('coverImage') ,verifyToken, updateUserCoverImage)
router.route('/change-password').post(verifyToken, changeCurrentPassword)

export default router