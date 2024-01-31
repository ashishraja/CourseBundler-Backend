import mongoose from "mongoose";
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

export const Course = mongoose.model("Course", schema);