import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user data from FE
  // data validation
  // is duplicate user
  // user profile image
  // upload to cloudinary
  // confirm if image uploaded
  // create user object to save monogo db
  // create entryin db
  // remove pwd in refresh token from response
  // check for user is created or not
  // if created then send response
  // if not created then send error response

  const { userName, fullName, email, password } = req.body;

  if (
    [fullName, userName, email, password].some((item) => item.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const isUserExist = await User.findOne({
    $or: [{ userName: userName }, { email: email }],
  });
  if (isUserExist) throw new ApiError(400, "User already exist");

  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath && !coverImageLocalPath) {
    throw new ApiError(400, "Profile images are required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar && !coverImage) {
    throw new ApiError(400, "Profile images are required");
  }

  // database entry
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage.url,
  });

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!isUserCreated) throw new ApiError(500, "User not created");

  return res.status(201).json(
    new ApiResponse(200, {
      message: "User registered successfully",
      isUserCreated,
    })
  );
});

export default registerUser;
