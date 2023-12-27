import mongoose from "mongoose";

// const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const schema = new mongoose.Schema({

        title:{
            type:String,
            required:[true,"Please enter course title"],
        },
        description:{
            type:String,
            required:[true,"Please enter course descritpion"],
        },
        lectures:[
            {
                title:{
                    type:String,
                    required:[true,"Please enter course title"],
                },
                description:{
                    type:String,
                    required:[true,"Please enter Description"],
                },
                video:{
                    public_id:{
                        type:String,
                        required:true
                    },
                    url:{
                        type:String,
                        reuired:true
                    }
                },
            }
        ],

        poster:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                reuired:true
            }
        },
       
        views:{
            type:Number,
            default:0
        },

        noOfVideos:{
            type:Number,
            default:0
        },

        category: {
            type:String,
            required:true
        },

        createdBy: {
            type:String,
            required:[true , "Enter Course Creator Name"],
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

// userSchema.pre("save",async function(next){
//     if(!this.isModified("password")){
//         next();    
//     }
//     console.log(this.password);
//     this.password  = await bcrypt.hash(this.password,10);
// });

// //yeh bhi thoda samaj nahi aaya hai...
// userSchema.methods.getJWTToken = function(){
//     return jwt.sign({id:this._id},process.env.JWT_SECRET,{
//         expiresIn : process.env.JWT_EXPIRE
//     });
// }

// userSchema.methods.comparePassword = async function(password){
//     return await bcrypt.compare(password,this.password);
// }

// userSchema.methods.getResetPasswordToken = function () {
//     // Generating Token
//     const resetToken = crypto.randomBytes(20).toString("hex");
  
//     // Hashing and adding resetPasswordToken to userSchema
//     this.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
  
//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
//     return resetToken;
//   };



export const Course = mongoose.model("Course", schema);