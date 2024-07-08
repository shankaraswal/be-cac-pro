import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

// ---------------------------------------------------------------
// GENERATE REFRESH TOKEN AND ACCESS TOKEN FN
// ---------------------------------------------------------------
/**
 * Generates an access token and a refresh token for a user.
 *
 * @param {string} userId - The ID of the user to generate tokens for.
 * @returns {Object} - An object containing the generated access token and refresh token.
 * @throws {ApiError} - If there is an error while generating the tokens.
 */

const generateTokens = async (userId) => {
  try {
    /**
     * Retrieves the user with the specified userId from the database.
     *
     * @param {string} userId - The ID of the user to retrieve.
     * @returns {Promise<User>} - The user object with the specified userId.
     * @throws {ApiError} - If there is an error retrieving the user from the database.
     */
    const user = await User.findById(userId);

    /**
     * Generates an access token for the user.
     *
     * @param {string} userId - The ID of the user to generate the access token for.
     * @returns {string} - The generated access token.
     * @throws {ApiError} - If there is an error while generating the access token.
     */
    const accessToken = user.generateAccessToken();

    /**
     * Generates a refresh token for the user.
     *
     * @param {string} userId - The ID of the user to generate the refresh token for.
     * @returns {string} - The generated refresh token.
     * @throws {ApiError} - If there is an error while generating the refresh token.
     */
    const refreshToken = user.generateRefreshToken();

    /**
     * Saves the generated refresh token for the user.
     *
     * @param {string} refreshToken - The generated refresh token for the user.
     */
    user.refreshToken = refreshToken;

    /**
     * Saves the user object to the database, skipping the validation before saving.
     *
     * @returns {Promise<void>} - A promise that resolves when the user object is saved.
     * @throws {Error} - If there is an error saving the user object to the database.
     */
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
  }
};

// ---------------------------------------------------------------
// REGISTER USER
// ---------------------------------------------------------------
/**
 * Registers a new user by creating a new user account in the database.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.userName - The username of the new user.
 * @param {string} req.body.fullName - The full name of the new user.
 * @param {string} req.body.email - The email address of the new user.
 * @param {string} req.body.password - The password of the new user.
 * @param {Object} req.files - The uploaded profile images for the new user.
 * @param {Object} req.files.avatarImage - The uploaded avatar image for the new user.
 * @param {Object} req.files.coverImage - The uploaded cover image for the new user.
 * @param {Object} res - The Express response object.
 * @returns {ApiResponse} - A successful API response with the newly created user details.
 * @throws {ApiError} - If any required fields are missing, the user already exists, or there is an error uploading the profile images.
 */
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

  /**
   * Extracts the user data from the request body.
   *
   * @param {Object} req - The Express request object.
   * @param {string} req.body.userName - The username of the new user.
   * @param {string} req.body.fullName - The full name of the new user.
   * @param {string} req.body.email - The email address of the new user.
   * @param {string} req.body.password - The password of the new user.
   */
  const { userName, fullName, email, password } = req.body;

  /**
   * Validates that all required user data fields are provided.
   *
   * @param {string} fullName - The full name of the user.
   * @param {string} userName - The username of the user.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @throws {ApiError} - If any of the required fields are empty or contain only whitespace.
   */
  if (
    [fullName, userName, email, password].some((item) => item.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  /**
   * Checks if a user with the given username or email already exists in the database.
   *
   * @param {string} userName - The username to check for.
   * @param {string} email - The email address to check for.
   * @returns {Promise<boolean>} - True if a user with the given username or email exists, false otherwise.
   */
  const isUserExist = await User.findOne({
    $or: [{ userName: userName }, { email: email }],
  });

  /**
   * Checks if a user with the given username or email already exists in the database.
   *
   * @param {string} userName - The username to check for.
   * @param {string} email - The email address to check for.
   * @throws {ApiError} - If a user with the given username or email already exists.
   */
  if (isUserExist) throw new ApiError(400, "User already exist");

  /**
   * Extracts the path of the avatar image file from the request files.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} req.files - The uploaded files attached to the request.
   * @param {Object} req.files.avatarImage - The uploaded avatar image file.
   * @param {string} req.files.avatarImage[0].path - The local file path of the uploaded avatar image.
   */
  const avatarLocalPath = req.files?.avatarImage[0].path;

  /**
   * Extracts the path of the cover image file from the request files.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} req.files - The uploaded files attached to the request.
   * @param {Object} req.files.coverImage - The uploaded cover image file.
   * @param {string} req.files.coverImage[0].path - The local file path of the uploaded cover image.
   */
  const coverImageLocalPath = req.files?.coverImage[0].path;

  /**
   * Checks if both the avatar and cover image local paths are empty, and throws an API error if so.
   *
   * @throws {ApiError} - If both the avatar and cover image local paths are empty, with a 400 status code and the message "Profile images are required".
   */
  if (!avatarLocalPath && !coverImageLocalPath) {
    throw new ApiError(400, "Profile images are required");
  }

  /**
   * Uploads the avatar image to Cloudinary and returns the uploaded image URL.
   *
   * @param {string} avatarLocalPath - The local file path of the uploaded avatar image.
   * @returns {Promise<{ url: string }>} - The uploaded avatar image URL.
   */
  const avatarImage = await uploadOnCloudinary(avatarLocalPath);

  /**
   * Uploads the cover image to Cloudinary and returns the uploaded image URL.
   *
   * @param {string} coverImageLocalPath - The local file path of the uploaded cover image.
   * @returns {Promise<{ url: string }>} - The uploaded cover image URL.
   */
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatarImage && !coverImage) {
    throw new ApiError(400, "Profile images are required");
  }

  // DATABASE ENTRY
  /**
   * Creates a new user in the database with the provided user information.
   *
   * @param {Object} fullName - The full name of the user.
   * @param {string} userName - The username of the user, converted to lowercase.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @param {string} avatarImage.url - The URL of the uploaded avatar image.
   * @param {string} coverImage.url - The URL of the uploaded cover image.
   * @returns {Promise<User>} - The newly created user object.
   */
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatarImage: avatarImage.url,
    coverImage: coverImage.url,
  });

  /**
   * Retrieves the newly created user from the database, excluding the password and refreshToken fields.
   *
   * @returns {Promise<User>} - The newly created user object, with the password and refreshToken fields excluded.
   */
  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  /**
   * Throws an `ApiError` with a 500 status code and the message "User not created" if the `isUserCreated` variable is falsy.
   * This is likely used as a safeguard to ensure that a user was successfully created in the database before proceeding with the response.
   */
  if (!isUserCreated) throw new ApiError(500, "User not created");

  return res.status(201).json(
    new ApiResponse(200, {
      message: "User registered successfully",
      isUserCreated,
    })
  );
});

// ---------------------------------------------------------------
// LOGIN USER
// ---------------------------------------------------------------
/**
 * Logs in a user by verifying their credentials and generating access and refresh tokens.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.email - The email address of the user.
 * @param {string} req.body.userName - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The Express response object.
 * @returns {ApiResponse} - A successful API response with the user's details and tokens.
 * @throws {ApiError} - If the user does not exist or the password is invalid.
 */
const loginUser = asyncHandler(async (req, res) => {
  /**
   * Extracts the email, userName, and password values from the request body.
   * These values are typically used for user authentication or registration.
   *
   * @param {Object} req - The Express request object.
   * @param {string} req.body.email - The email address of the user.
   * @param {string} req.body.userName - The username of the user.
   * @param {string} req.body.password - The password of the user.
   */
  const { email, userName, password } = req.body;

  /**
   * Validates that either a username or email is provided in the request body.
   * If neither is provided, throws an `ApiError` with a 400 status code and the message "Either username or email required".
   */
  if (!(userName || email)) {
    throw new ApiError(400, "Either username or email required");
  }

  /**
   * Finds a user in the database based on either the provided username or email.
   *
   * @param {Object} options - The options object containing the username or email to search for.
   * @param {string} [options.userName] - The username of the user to find.
   * @param {string} [options.email] - The email address of the user to find.
   * @returns {Promise<User>} - The found user document, or null if no user is found.
   */
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  /**
   * Checks if a user exists in the database. If the user does not exist, throws an `ApiError` with a 401 status code and the message "User does not exist".
   *
   * @param {Object} user - The user object to check.
   * @throws {ApiError} If the user does not exist.
   */
  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  /**
   * Validates the user's password by comparing it to the stored password hash.
   *
   * @param {string} password - The password provided by the user for authentication.
   * @returns {Promise<boolean>} - True if the password is valid, false otherwise.
   */
  const isValidPasswrd = await user.isPasswordCorrect(password);

  /**
   * Validates the user's password by comparing it to the stored password hash.
   * If the password is invalid, throws an `ApiError` with a 401 status code and the message "Invalid password".
   *
   * @param {string} password - The password provided by the user for authentication.
   * @throws {ApiError} If the password is invalid.
   */
  if (!isValidPasswrd) {
    throw new ApiError(401, "Invalid password");
  }

  /**
   * Generates access and refresh tokens for the authenticated user.
   *
   * @param {string} userId - The ID of the user to generate tokens for.
   * @returns {Promise<{ accessToken: string, refreshToken: string }>} - The generated access and refresh tokens.
   */
  const { accessToken, refreshToken } = await generateTokens(user._id);

  /**
   * Finds the logged-in user's details, excluding the password and refresh token.
   *
   * @returns {Promise<User>} - The logged-in user's details, excluding the password and refresh token.
   */
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  /**
   * Sets the options for the access and refresh tokens in the response cookies.
   * The cookies are set to be HttpOnly and Secure, which means they can only be accessed by the server and are transmitted over HTTPS.
   */
  const options = {
    httpOnly: false,
    secure: false,
  };

  /**
   * Returns a successful API response with the logged-in user's details, access token, and refresh token.
   *
   * @param {Object} res - The Express response object.
   * @param {User} loggedInUser - The logged-in user's details, excluding the password and refresh token.
   * @param {string} accessToken - The generated access token for the authenticated user.
   * @param {string} refreshToken - The generated refresh token for the authenticated user.
   * @returns {ApiResponse} - A successful API response with the user's details and tokens.
   */
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

// ---------------------------------------------------------------
// LOGOUT USER
// ---------------------------------------------------------------
/**
 * Logs out the currently authenticated user by removing the refresh token from the user's record and clearing the access and refresh token cookies.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<ApiResponse>} - A successful API response indicating the user has been logged out.
 */
const logoutUser = asyncHandler(async (req, res) => {
  /**
   * Removes the refresh token from the user's record in the database.
   *
   * @param {Object} req - The Express request object.
   * @param {string} req.user._id - The ID of the currently authenticated user.
   * @returns {Promise<User>} - The updated user document with the refresh token removed.
   */
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  /**
   * Options for setting cookies on the response.
   * @type {Object}
   * @property {boolean} httpOnly - Indicates whether the cookie is accessible only by the web server.
   * @property {boolean} secure - Indicates whether the cookie should only be sent over a secure protocol (HTTPS).
   */
  const options = {
    httpOnly: true,
    secure: true,
  };

  /**
   * Logs out the currently authenticated user by clearing the access and refresh token cookies.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @returns {Promise<ApiResponse>} - A successful API response indicating the user has been logged out.
   */
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ---------------------------------------------------------------
// REFRESH ACCESS TOKEN FOR SESSION RENEWAL
// ---------------------------------------------------------------
/**
 * Refreshes the access token for the current user session.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req?.cookies?.refreshToken - The refresh token from the request cookies.
 * @returns {Promise<ApiResponse>} - A successful API response containing the refreshed access and refresh tokens.
 * @throws {ApiError} - If the refresh token is missing, invalid, or expired.
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  /**
   * Retrieves the refresh token from the request cookies.
   *
   * @param {Object} req - The Express request object.
   * @param {string} req?.cookies?.refreshToken - The refresh token from the request cookies.
   * @returns {string|undefined} - The refresh token if present, otherwise undefined.
   */
  const newRefreshToken = req?.cookies?.refreshToken;

  /**
   * Checks if a refresh token is present in the request. If not, throws an unauthorized error.
   *
   * @param {Object} req - The Express request object.
   * @throws {ApiError} - If the refresh token is missing, throws an unauthorized error with a status code of 401.
   */
  if (!newRefreshToken) {
    throw new ApiError(401, "Unauthorized request found");
  }

  try {
    /**
     * Verifies the provided refresh token and decodes the token to retrieve the user ID.
     *
     * @param {string} newRefreshToken - The refresh token to be verified.
     * @returns {Object} - The decoded token payload, which includes the user ID.
     * @throws {ApiError} - If the refresh token is invalid or expired.
     */
    const decodeToken = jwt.verify(
      newRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    /**
     * Retrieves the user document from the database based on the decoded token's user ID.
     *
     * @param {string} decodeToken._id - The user ID extracted from the decoded refresh token.
     * @returns {Promise<User>} - The user document retrieved from the database.
     * @throws {ApiError} - If the user is not found in the database.
     */
    const userId = await User.findById(decodeToken._id);

    /**
     * Checks if a valid user ID was found in the decoded refresh token. If not, throws an unauthorized error.
     *
     * @param {Object} userId - The user document retrieved from the database based on the decoded refresh token.
     * @throws {ApiError} - If the user ID is not found, throws an unauthorized error with a status code of 401.
     */
    if (!userId) {
      throw new ApiError(401, "Invalid token found");
    }

    /**
     * Checks if the provided refresh token matches the user's current refresh token. If not, throws an unauthorized error with a status code of 401.
     *
     * @param {string} newRefreshToken - The refresh token from the request.
     * @param {string} userId.refreshToken - The user's current refresh token stored in the database.
     * @throws {ApiError} - If the refresh token is expired, throws an unauthorized error with a status code of 401.
     */
    if (newRefreshToken !== userId?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    /**
     * Options for setting the access and refresh tokens as cookies.
     * These options specify that the cookies should not be marked as HttpOnly or Secure.
     *
     * @type {Object}
     * @property {boolean} httpOnly - Indicates whether the cookie should be accessible only by the web server.
     * @property {boolean} secure - Indicates whether the cookie should be sent only over a secure protocol (HTTPS).
     */
    const options = {
      httpOnly: false,
      secure: false,
    };

    /**
     * Generates access and refresh tokens for the user with the provided user ID.
     *
     * @param {string} userId - The ID of the user to generate tokens for.
     * @returns {Object} - An object containing the generated access and refresh tokens.
     */
    const { accessToken, refreshToken } = await generateTokens(userId._id);

    /**
     * Refreshes the user's access and refresh tokens.
     *
     * @param {Object} res - The response object.
     * @param {string} accessToken - The new access token to be set in the response.
     * @param {string} refreshToken - The new refresh token to be set in the response.
     * @param {Object} options - The options for setting the access and refresh tokens as cookies.
     * @returns {Promise<Object>} - A response with the new access and refresh tokens.
     * @throws {ApiError} - If the token is invalid or expired.
     */
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    /**
     * Throws an API error with a 401 status code and the provided error message, or a default message if the error message is not available.
     *
     * @param {Error} error - The error object that triggered the API error.
     * @throws {ApiError} - An API error with a 401 status code and the error message.
     */
    throw new ApiError(401, error.message || "Invalid token found");
  }
});

// ---------------------------------------------------------------
// TO CHANGE PASSWORD USER SHOULD LOGGEDIN BEFORE
// ---------------------------------------------------------------
/**
 * Changes the current user's password.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.oldPassword - The user's current password.
 * @param {string} req.body.newPassword - The new password to be set.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A response with a success message.
 * @throws {ApiError} - If the old password does not match the user's current password.
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  /**
   * The old password and new password provided in the request body.
   *
   * @param {string} oldPassword - The user's current password.
   * @param {string} newPassword - The new password to be set.
   */
  const { oldPassword, newPassword } = req.body;

  console.log(req.body);

  /**
   * Retrieves the current user from the database based on the user ID in the request.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.user - The authenticated user object.
   * @param {string} req.user._id - The ID of the authenticated user.
   * @returns {Promise<User>} - The user document retrieved from the database.
   */
  const user = await User.findById(req.user._id);

  /**
   * Checks if the provided old password matches the user's current password.
   *
   * @param {string} oldPassword - The old password provided by the user.
   * @returns {Promise<boolean>} - `true` if the old password is correct, `false` otherwise.
   */
  const isValidPasswrd = await user.isPasswordCorrect(oldPassword);

  /**
   * Checks if the provided old password matches the user's current password.
   *
   * @throws {ApiError} - If the old password does not match the user's current password.
   */
  if (!isValidPasswrd) {
    throw new ApiError(401, "Old password does not match");
  }

  /**
   * Sets the user's password to the new password provided.
   *
   * @param {string} newPassword - The new password to be set for the user.
   */
  user.password = newPassword;

  /**
   * Saves the updated user document to the database, skipping the validation checks.
   *
   * @returns {Promise<User>} - The saved user document.
   */
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ---------------------------------------------------------------
// GET CURRENT USER
// ---------------------------------------------------------------
/**
 * Retrieves the current user from the request and sends a response with the user data.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user._id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  /**
   * Sends a response with the current user data.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.user - The authenticated user object.
   * @param {string} req.user._id - The ID of the authenticated user.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */

  await res
    .status(200)
    .json(new ApiResponse(200, req.user, "Fetched current user data"));
});

// ---------------------------------------------------------------
// ---------------------------------------------------------------
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  // TODO: check if user is logged in
});

// ---------------------------------------------------------------
// ---------------------------------------------------------------
const updateUserAvatar = asyncHandler(async (req, res) => {
  // TODO: check if user is logged in
});

// ---------------------------------------------------------------
// ---------------------------------------------------------------
const updateUserCoverImage = asyncHandler(async (req, res) => {
  // TODO: check if user is logged in
});

// ---------------------------------------------------------------
// ---------------------------------------------------------------
const getUserChannelProfile = asyncHandler(async (req, res) => {
  // TODO: check if user is logged in
});

// ---------------------------------------------------------------
// ---------------------------------------------------------------
const getWatchHistory = asyncHandler(async (req, res) => {
  // TODO: check if user is logged in
});

export {
  registerUser,
  loginUser,
  logoutUser,
  generateTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
