import { Router } from "express";
import {
    getCurrentUser,
    getUserChannelProfile,
    LoginUser, logoutUser,
    refreshAccessToken,
    RegisterUser,
    updateAvatar,
    updateCoverImage,
    UserWatchHistory,
    changeCurrentPassword,
    updateAccountDetails

}
    from "../controllers/user.controller.js"
    
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";





const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar", // file name Avatar
            maxCount: 1
        },

        {
            name: "coverImage", // filename CoverImage
            maxCount: 1
        }
    ]),
    RegisterUser

)

router.route("/login").post(LoginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)

router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watchHistory").get(verifyJWT, UserWatchHistory)


export default router