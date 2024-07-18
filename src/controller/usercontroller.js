import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/usermodals.js";
import Uploadimage from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/Apierror.js";
import jwt from 'jsonwebtoken'

const generateRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };
    } catch (error) {
        console.error("Error in generateRefreshToken:", error.message);
        throw new ApiError(500, "Error while creating tokens");
    }
};

const registerUser = asynchandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
    });

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let avatarUrl = "";
    let coverImageUrl = "";

    try {
        if (avatarLocalPath) {
            const avatar = await Uploadimage(avatarLocalPath);
            avatarUrl = avatar.url;
        }
        if (coverImageLocalPath) {
            const coverImage = await Uploadimage(coverImageLocalPath);
            coverImageUrl = coverImage.url;
        }

        user.avatar = avatarUrl;
        user.coverImage = coverImageUrl;

        await user.save();

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
    } catch (error) {
        console.error("Error during registration:", error.message);
        // If there's an error, clean up any uploaded images
        if (avatarUrl) {
            // Assuming you have a deleteImage function to delete images from Cloudinary
            await cloudinary.uploader.destroy(avatarUrl);
        }
        if (coverImageUrl) {
            await cloudinary.uploader.destroy(coverImageUrl);
        }

        await User.findByIdAndDelete(user._id); // Delete the created user if there's an error

        throw new ApiError(500, "Error occurred during registration. Please try again.");
    }
});

const loginuser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logout = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "Logout successful"));
});
const refreshacesstoken= asynchandler(async(req,res)=>{
    const incomingRefreshtoken=req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshtoken){
        throw new ApiError(401,"invalid incomming token")
    }
    const decodedToken=jwt.verify(
        incomingRefreshtoken,
        process.env.REFRESH_TOKEN
    )
    const user=await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(400,"invalid token")
    }
    if(incomingRefreshtoken !=user.refreshToken){
        throw new ApiError(400,"refresh toekn is expeired")
    }

    const options={
        httpOnly:true,
        secure:true
    }

    const {refreshtoken,accessToken}=await generateRefreshToken(user._id)

    return res
    .status(200)
    .cookie("refreshtoken",refreshtoken,options)
    .cookie("acesstoken",accessToken,options)
    .json(
        new ApiResponse(
            200,
            {refreshtoken,accessToken},
            "sucessfully"
        )
    )
})


const changepassword=asynchandler(async(req, res)=>{
    const {oldpassword,newpasswprd}=req.body
    const user =await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect){
        throw new  ApiError(400,"Password does not match")
    }
    

    user.password=newpasswprd

    await user.save({validateBeforeSave:false})

    return res
    .json(
        new ApiResponse(200,{},"data Save Sucessfully")
    )
})

const getcurrentuser=asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.res,"user fetch sucessfuly")
    )
})

const updateprofile= asynchandler(async(req, res)=>{
    const {fullname,email}=req.body

    if(!fullname || email){
        throw new ApiError(400,"field is required")
    }

    const user=User.findOneAndUpdate(
        req.res._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "data updated sucessfully"
        )
    )

})
export { 
    registerUser,
    loginuser,
    logout,
    refreshacesstoken,
    getcurrentuser,
    changepassword,
    updateprofile
};
