import express from "express";
import { resetPassword , forgotPassword , getAllUsers , getUserDetails, loginUser, logout, register, updatePassword, addToPlaylist, removeFromPlaylist, updateProfilePicture, updateProfile, getSingleUserDetails, updateUserRole, deleteUser, deleteMyProfile } from "../Controllers/userController.js";
import { authorizeRoles, isAuthenticatedUser } from "../Middleware/authentication.js";
import singleUpload from "../Middleware/Multer.js";
const router = express.Router();


router.route("/register").post(singleUpload , register);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/profile").get(isAuthenticatedUser , getUserDetails)
.delete(isAuthenticatedUser , deleteMyProfile);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetPassword/:token").put(resetPassword);
router.route("/updatepassword").put(isAuthenticatedUser , updatePassword);
router.route("/updateprofile").put(isAuthenticatedUser , updateProfile);
router.route("/updateprofilepicture").put(isAuthenticatedUser , singleUpload , updateProfilePicture);
router.route("/addtoplaylist").post(isAuthenticatedUser,addToPlaylist);
router.route("/removefromplaylist").delete(isAuthenticatedUser,removeFromPlaylist);

// admin routes
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles , getAllUsers);
router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizeRoles , getSingleUserDetails)
.put(isAuthenticatedUser, authorizeRoles , updateUserRole)
.delete(isAuthenticatedUser, authorizeRoles , deleteUser);


export default router;