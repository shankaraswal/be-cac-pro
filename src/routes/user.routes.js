import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
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

export default router;
