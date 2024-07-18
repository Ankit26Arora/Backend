
import jwt from "jsonwebtoken"
import { asynchandler } from "../utils/asynchandler.js";
import ApiError from "../utils/Apierror.js";
import { User } from "../models/usermodals.js";

export const verifyJWT = asynchandler(async(req, _, next) => {
    console.log("user is ",User)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKENS)
        console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            // console.log(user)
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})