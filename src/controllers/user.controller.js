import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }

}

const RegisterUser = asynchandler(async (req, res) => {
  // Algorithm ->

  // get user details from frontend
  // validation - not empty
  // check for images , check for avatar
  // upload them to cloudinary  , avatar
  //create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response


  const { fullname, email, username, password } = req.body

  if (
    //  check if value are empty or not
    [fullname, email, username].some((data) =>
      data?.trim() === "")

  ) {
    throw new ApiError(400, "All fields must required")
  }
  // Step 2
  const existedUser = await User.findOne({
    $or: [{ username }, { email }] //give document related field

  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username is already exist")
  }

  console.log(email, fullname, username, password)
  //Step3
  //files from multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  console.log(req.files)

  console.log(email, fullname, username, password)
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file must required")
  }

  // step 4 upload on cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath)
  const coverImage = await uploadToCloudinary(coverImageLocalPath)


  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }


  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })


  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken" //we dont get password and refreshToken
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong wile registering user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered Successfully")
  )

})


const LoginUser = asynchandler(async (req, res) => {
  // Algorithm
  // bring data from req body
  // username or email 
  // find respecred user in database
  // checking password 
  // access and refresh token generate send to user in cookie
  // login successfully

  const { username, email, password } = req.body // bring respected data 

  if (!username && !email) {
    throw new ApiError(400, "Username or Email required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  }
  )

  if (!user) {
    throw new ApiError(404, "User is not register ")

  }

  const checkingPassword = await user.isPasswordCorrect(password)

  if (!checkingPassword) {
    throw new ApiError(401, "Invalid password")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  // sending  Token in cookies

  const LogedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true, //only modify by server
    secure: true,
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: LogedUser, accessToken, refreshToken
      },
        "User login successfully"
      )
    )

})

const logoutUser = asynchandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null
      }

    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true, //only modify by server
    secure: true,
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})


const refreshAccessToken = asynchandler(async (req, res) => {
  try {
    const incommingRefToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefToken) {
      throw new ApiError(401, "Unauthorized request")

    }
    const decodedToken = jwt.verify(
      incommingRefToken,
      process.env.REFRESH_TOKRN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incommingRefToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or use")

    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: refreshToken })
      )



  } catch (error) {
    throw new ApiError(401, "Invalif refreshToken")
  }

})

const changeCurrentPassword = asynchandler(async (req, res) => {

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "Invalid confirm password")
  }

  const user = await User.findById(req.user?._id)
  const Check = await user.isPasswordCorrect(oldPassword)

  if (!Check) {
    throw new ApiError(400, "Invalid  old password ")
  }


  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))


})

const getCurrentUser = asynchandler(async (req, res) => {
  return res.status(200).json(200, req.user)
})

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullname, email, name } = req.body;

  if (!fullname || !email || !name) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullname,
      email,
      name
    }
  }, { new: true }).select("-password");
  return res.status(200).json(200 , "Account detail update successfully")

})

const updateAvatar = asynchandler(async (req, res) => {

  const avatarLocalPath = req.file?.path
  ''
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")

  }

  const avatar = uploadToCloudinary(avatarLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Error while uploading")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      },

    }, { new: true }

  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "Avatar updated successfully")
  )

})



const updateCoverImage = asynchandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing")

  }

  const coverImage = uploadToCloudinary(coverImageLocalPath)

  if (!coverImage) {
    throw new ApiError(400, "Error while uploading")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }

    }, { new: true }

  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "CoverImage updated successfully")
  )

})

const getUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      },

      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      },
      $lookup: {
        form: "Subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      },
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        chhannelSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribe: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }


        }

      }

    },

    {
      $project: {
        fullname: 1,
        username: 1,
        subscribedTo: 1,
        isSubscribe: 1,
        avatar: 1,
        coverImage: 1,

      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")

  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")

    )
})


const UserWatchHistory = asynchandler(async(req , res) => {
 const user = await User.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(req.user._id)

    }
  },
 {
  $lookup: {
    from : "Video",
    localField: "watchHistory",
    foreignField: "_id",
    as: "watchHistory",
    pipeline: [
      {
        $lookup: {
          from : "User",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar:1,
              }
            }
          ]
        }
      },
      {
        $addFields:{
          owner: {
            $first: "$owner"
          }
        }
      }
    ]
  }
 }


 ])

 return res
 .status(200)
 .json(
  new ApiResponse(200 , user[0].watchHistory,"user watched history successfullt fetched")
 )
})



export {
  RegisterUser,
  LoginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  UserWatchHistory


}

