import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/usermodals.js";
import Uploadimage from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/Apierror.js";

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

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
  } catch (error) {
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

export { registerUser };
