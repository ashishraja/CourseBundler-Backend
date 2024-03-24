import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import {Course} from "../Models/Course.js"
import getDataUri from "../Utils/dataUri.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../Models/Stats.js";
import { User } from "../Models/User.js";

export const getAllCourses = catchAsyncErrors(async (req,res,next) => {
    try{

        const keyword  = req.query.keyword || "";
        const category  = req.query.category || "";

        const courses = await Course.find({
            title:{
                $regex:keyword,
                $options:"i",
            },
            category:{
                $regex:category,
                $options:"i",
            }
        });
        res.status(200).json({
            success:true,
            courses,
        });
    } catch (error) {
        console.log(error);
    }
});

export const createCourse = catchAsyncErrors(async (req,res,next) => {

    const {title , description , category , createdBy} = req.body;

    const file = req.file;
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content)

    await Course.create({
        title,
        description, 
        createdBy, 
        category, 
        poster : {
            public_id : myCloud.public_id,
            url : myCloud.secure_url,
        }
    });

    res.status(200).json({
        success:true,
        message:"Course Created Successfully. You can add the lectures now."
    });
});


export const getCourseById = catchAsyncErrors(async (req,res,next) => {

    const course = await Course.findById(req.params.id);
    if(!course){
        return next(new ErrorHandler("Course Not Found...",404));
    }

    await course.save();

    res.status(200).json({
        success:true,
        course:course,
    });

});



export const getCourseLectures = catchAsyncErrors(async (req,res,next) => {

        const course = await Course.findById(req.params.id);
        if(!course){
            return next(new ErrorHandler("Course Not Found...",404));
        }

        course.views += 1;
        await course.save();


        res.status(200).json({
            success:true,
            lectures:course.lectures,
        });
    
});

export const addCourseLecture = catchAsyncErrors(async (req,res,next) => {

    const {title,description} = req.body;
    const {id} = req.params;

    const course = await Course.findById(id);
    if(!course){
        return next(new ErrorHandler("Course Not Found...",404));
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content,{
        resource_type:"video"
    });


   course.lectures.push({
    title,
    description,
    video:{
        public_id : myCloud.public_id,
        url : myCloud.secure_url,
    }
   });

   course.noOfVideos = course.lectures.length;
   await course.save();

    res.status(200).json({
        success:true,
        message:"Course lectures added successfully...",
    });

});


export const deleteCourse = catchAsyncErrors(async (req,res,next) => {

    const { id } = req.params;
    const course = await Course.findById(id);

    if(!course){
        return next(new ErrorHandler("Course Not Found" , 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    for (let i = 0; i < course.lectures.length; i++) {
        if (course.lectures[i].video && course.lectures[i].video.public_id){
                await cloudinary.v2.uploader.destroy(course.lectures[i].video.public_id ,{
                    resource_type:"video",
                });
        }
    }

    await course.deleteOne({_id:id});

    res.status(200).json({
        success:true,
        message:"Course Deleted Successfully."
    });
});

export const deleteLecture = catchAsyncErrors(async (req,res,next) => {

    const { courseId , lectureId } = req.query;
    const course = await Course.findById(courseId);

    if(!course){
        return next(new ErrorHandler("Course Not Found" , 404));
    }

    if(course && !lectureId){
        return next(new ErrorHandler("No Lectures Found..."));
    }

    const lecture = course.lectures.find((item)=>{
        if(item._id.toString() === lectureId.toString()){
            return item;
        }
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id ,{
        resource_type:"video",
    });

    course.lectures = course.lectures.filter((item)=>{
        if(item._id.toString() !== lectureId.toString()){
            return item;
        }
    });

    course.noOfVideos = course.lectures.length;
    await course.save();


    res.status(200).json({
        success:true,
        message:"Lectures Deleted Successfully."
    });
});

Course.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);

    const courses = await Course.find({});
    let totalViews=0;

    for(let i=0;i<courses.length;i++){
        totalViews += courses[i].views;
    }
    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})