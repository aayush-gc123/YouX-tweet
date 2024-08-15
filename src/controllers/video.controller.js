import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/Apierror.js"
import { asynchandler } from "../utils/asynchandler.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const filter = query?{title:{$regex: query , $options: "i"}}:{}

    if(userId){
        filter.userId = userId
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortType === "desc" ? -1:1

    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page-1)*limit)
    .limit(parseInt(limit))

    const total = await Video.countDocuments(filter)

    res.status(200).json({
        success: true,
        data: videos,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
    })
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}