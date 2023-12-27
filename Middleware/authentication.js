import jwt from "jsonwebtoken";
import {User} from "../Models/User.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";

export const isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{
    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler("PLEASE lOGIN TO ACCESS THE RESOURCES",401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
})

export const authorizeRoles = (req,res,next) => {
        if(req.user.role!== "admin"){
            return next(new ErrorHandler(
                `Role : ${req.user.role} is not allowed to access this resource`,403
            ));
        }

        next();
}

export const authorizeSubscribers = (req,res,next) => {
    if(req.user.role !== "admin" && req.user.subscription.status !== "active"){
        return next(new ErrorHandler(
            `ONLY SUBSCRIBERS CAN ACCESS THIS RESOURCE`,403
        ));
    }

    next();
}
