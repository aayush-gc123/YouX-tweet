import mongoose from 'mongoose';
import { Tweet } from '../models/tweet.model.js'; 
import { ApiResponse } from '../utils/ApiResponse.js'; 

import { asynchandler } from '../utils/asynchandler.js'; 
import { User } from '../models/user.model.js'; 
import { ApiError } from '../utils/Apierror.js';

// Create a new tweet
const createTweet = asynchandler(async (req, res) => {
    console.log("hello" , req.body)
    const { content, UserID } = req.body;

    if (!UserID) {
        throw new ApiError(400, "UserID is required");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!mongoose.isValidObjectId(UserID)) {
        throw new ApiError(400, "Invalid UserID");
    }

    // Check if the user exists
    const userExists = await User.findById(UserID);

    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const newTweet = new Tweet({
        content,
        user: UserID
    });

    try {
        await newTweet.save();
        res.status(201).json(new ApiResponse(201, "Tweet created successfully"));
    } catch (error) {
        console.error('Database Error:', error); // Log error details
        throw new ApiError(500, "Failed to save in database");
    }
});


// Get tweets for a user
const getUserTweets = asynchandler(async (req, res) => {
    const { userID } = req.params;

    if (!mongoose.isValidObjectId(userID)) {
        throw new ApiError(400, "Invalid user ID");
    }

    try {
        const tweets = await Tweet.find({ user: userID }).populate("user", "username email");
        res.status(200).json(new ApiResponse(200, "User tweets found successfully", tweets));
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve tweets");
    }
});

// Update a tweet
const updateTweet = asynchandler(async (req, res) => {
    const { tweetID } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(tweetID)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetID,
        { content },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200).json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

// Delete a tweet
const deleteTweet = asynchandler(async (req, res) => {
    const { tweetID } = req.params;

    if (!mongoose.isValidObjectId(tweetID)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetID);

    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
