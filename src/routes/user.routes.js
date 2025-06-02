import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/user.controllers.js'
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
export default router