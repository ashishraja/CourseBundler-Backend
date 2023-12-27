import mongoose from "mongoose";

import crypto from "crypto";
import validator from "validator";
import jwt from "jsonwebtoken";
//ES6
import bcrypt from 'bcryptjs';
const schema = new mongoose.Schema({

        name:{
            type:String,
            required:[true,"Please enter your Name"],
            maxLength:[30,"Name cannot exceed more than 30 characters"],
            minLength:[6,"Name cannot be less than 6 characters"]
        },
        email:{
            type:String,
            required:[true,"Please enter your email address"],
            unique:true,
            validate:[validator.isEmail,"Please enter a valid Email"]
        },
        password:{
            type:String,
            required:[true,"Please enter your Password"],
            minLength:[8,"Password must be more than 8 characters"],
            select:false
        },
        avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                reuired:true
            }
        },
        role:{
            type:String,
            enum:["admin" , "user"],
            default:"user"
        },
        subscription: {
            id:String,
            status:String
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        playlist : [
            {
                course : {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Course"
                },
                poster:String,
            },
        ],
        
        resetPasswordToken:String,
        resetPasswordExpire:Date,
});

schema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();    
    }
    this.password  = await bcrypt.hash(this.password,10);
    next();
});

//yeh bhi thoda samaj nahi aaya hai...
schema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn : "15d"
    });
}

schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

schema.methods.getResetToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
  };



export const User = mongoose.model("User", schema);