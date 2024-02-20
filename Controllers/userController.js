import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import { User } from "../Models/User.js"
import { Course } from "../Models/Course.js"
import ErrorHandler from "../Utils/ErrorHandler.js";
import { sendToken } from "../Utils/sendToken.js";
import sendEmail from "../Utils/sendEmail.js";
import crypto from "crypto"
import cloudinary from "cloudinary"
import getDataUri from "../Utils/dataUri.js";
import { Stats } from "../Models/Stats.js";

export const register = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler(`User with email ${email} already exist`, 409));
    }
    
    const file = req.file;
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content)
    
    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    sendToken(user, 201, res, "Registered Successfully");
});


export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter your email and password!", 401));
    }


    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Password or email", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Password or email", 401));
    }

    sendToken(user, 200, res, `Welcome Back ${user.name}`);
});


export const logout = catchAsyncErrors(async (req, res, next) => {

    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }).json({
        success: true,
        message: "Logged Out Successfully"
    });
    
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

export const deleteMyProfile = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.deleteOne({ _id: req.user._id });

    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "User deleted Successfully"
    });

});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. \n ${resetPasswordUrl}
    If you have not requested for this then please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `CourseBundler Password recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email is sent to ${user.email} successfully`
        });

    } catch (e) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;


        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(e.message, 500));

    }

});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Reset Password Token is invalid or has been expired",
                400
            )
        );
    }
    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res, "Password changed successfully...");
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler(" oldPassword is incorrect", 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler(" Password is not matching with confirmPassword.", 404))
    }

    user.password =  req.body.newPassword;
    await user.save();

    sendToken(user, 200, res, "Password Updated Successfully...");
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {

    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!name || !email) {
        return next(new ErrorHandler("Please fill all the fields", 401));
    }
    if (name) {
        user.name = name;
    }
    if (email) {
        user.email = email;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully..."
    });

});

export const updateProfilePicture = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id);
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    try {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        const file = req.file;

        if (!file) {
            return next(new ErrorHandler("No file provided", 400));
        }

        const fileUri = getDataUri(file);

        if (!fileUri || !fileUri.content) {
            return next(new ErrorHandler("Invalid file data", 400));
        }

        const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

        user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Picture Updated Successfully..."
        });
    } catch (error) {
        return next(new ErrorHandler("Error updating profile picture", 500));
    }

});


export const addToPlaylist = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    

    if (!course) {
        return next(new ErrorHandler("Invalid Course ID", 404))
    }

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) {
            return true
        }
    });

    if (itemExist) {
        return next(new ErrorHandler("Item already Exists", 409));
    }

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    });

    await user.save();
    sendToken(user, 200, res, "Course added to playlist successfully");

});

export const removeFromPlaylist = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);

    if (!course) {
        return next(new ErrorHandler("Invalid Course ID", 404))
    }

    const playlistItems = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) {
            return item;
        }
    });

    user.playlist = playlistItems;
    await user.save();

    sendToken(user, 200, res, "Course removed from playlist successfully");

});

//details of all the users viewed by admin
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});


// details of single user viewed by admin.
export const getSingleUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`, 401));
    }
    res.status(200).json({
        success: true,
        user
    });

});

//update user role : admin
export const updateUserRole = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }
    if (user.role === "user") {
        user.role = "admin";
    } else {
        user.role = "user";
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Role Updated Successfully"
    });

});


// delete user by admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`, 401));
    }

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: "User deleted Successfully"
    });
});

User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

    const subscription = await User.find({ "subscription.status": "active" });

    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
});