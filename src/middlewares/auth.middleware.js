//check user is present or not

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asynchandler(async (req, _, next) => {
    console.log("Hello")
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken?._id) {
            throw new ApiError(401, "Unauthorized request: Invalid token structure");
        }

        // Find user based on the decoded token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Unauthorized request: User not found");
        }

        // Attach user to the request object
        req.user = user;
        
        next();
    } catch (error) {
        // Handle and throw API error
        console.error('JWT verification error:', error);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
