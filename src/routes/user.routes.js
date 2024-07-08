import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWToken } from "../middlewares/auth.middleware.js";
const router = Router();

// POST api/v1/users/register
router.route("/register").post(
  upload.fields([
    { name: "avatarImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// SECURED Router
router.route("/logout").post(verifyJWToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWToken, changeCurrentPassword);
// router.route("/current-user").get(verifyJWToken, getCurrentUser);
// router.route("/update-account").patch(verifyJWToken, updateAccountDetails);

// router
//   .route("/avatar")
//   .patch(verifyJWToken, upload.single("avatar"), updateUserAvatar);
// router
//   .route("/cover-image")
//   .patch(verifyJWToken, upload.single("coverImage"), updateUserCoverImage);

// router.route("/c/:username").get(verifyJWToken, getUserChannelProfile);
// router.route("/history").get(verifyJWToken, getWatchHistory);

// router.route("/change-password").post(verifyJWToken, changeCurrentPassword);
// router.route("/current-user").get(verifyJWToken, getCurrentUser);
// router.route("/update-account").patch(verifyJWToken, updateAccountDetails);

// router
//   .route("/avatar")
//   .patch(verifyJWToken, upload.single("avatar"), updateUserAvatar);
// router
//   .route("/cover-image")
//   .patch(verifyJWToken, upload.single("coverImage"), updateUserCoverImage);

// router.route("/c/:username").get(verifyJWToken, getUserChannelProfile);
// router.route("/history").get(verifyJWToken, getWatchHistory);
export default router;
