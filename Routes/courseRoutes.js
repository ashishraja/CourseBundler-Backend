import express from "express";
import { addCourseLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseById, getCourseLectures } from "../Controllers/courseController.js";
import { authorizeRoles, authorizeSubscribers, isAuthenticatedUser } from "../Middleware/authentication.js";
import singleUpload from "../Middleware/Multer.js";

const router = express.Router();

//get all courses
router.route("/courses").get(getAllCourses);
router.route("/course/:id").get(getCourseById);
//create new course : admin
router.route("/createcourse")
.post(isAuthenticatedUser , authorizeRoles , singleUpload ,createCourse);
router.route("/course/:id")
.get(isAuthenticatedUser ,  authorizeSubscribers , getCourseLectures)
.post(isAuthenticatedUser , authorizeRoles , singleUpload , addCourseLecture)
.delete(isAuthenticatedUser , authorizeRoles , deleteCourse);

router.route("/lecture")
.delete(isAuthenticatedUser , authorizeRoles , deleteLecture);



export default router;