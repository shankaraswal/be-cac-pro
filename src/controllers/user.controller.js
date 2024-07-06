import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// REGISTER USER
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

  const avatarLocalPath = req.files?.avatarImage[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath && !coverImageLocalPath) {
    throw new ApiError(400, "Profile images are required");
  }

  const avatarImage = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatarImage && !coverImage) {
    throw new ApiError(400, "Profile images are required");
  }

  // DATABASE ENTRY
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatarImage: avatarImage.url,
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

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  // get data from FE req body
  const { email, userName, password } = req.body;

  // check if user or email exist
  if (!userName || !email) {
    throw new ApiError(400, "Eigher username or password required");
  }
  const user = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  const isValidPasswrd = await user.isPasswordCorrect(password);

  if (!isValidPasswrd) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // CREATE COOKIE OBJECT
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("aswal", "shankar singh aswal", options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully"
      )
    );
});

// LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// GENERATE REFRESH TOKEN AND ACCESS TOKEN FN
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
    console.log(error);
  }
};

export { registerUser, loginUser, logoutUser, generateTokens };
