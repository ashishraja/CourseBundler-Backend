import app from "./app.js";
import cloudinary from 'cloudinary';
import nodecron from "node-cron";          
import {connectDatabase} from "./Config/database.js"
import { Stats } from "./Models/Stats.js";

connectDatabase();

cloudinary.v2.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import Razorpay from "razorpay";


export const razorpayInstance = new Razorpay({
  key_id:process.env.KEY_ID || "rzp_test_EbqBzrg93qAyyL",
  key_secret:process.env.KEY_SECRET || "tK1YoilKrz49NU6JNZaCxq61",
});

nodecron.schedule("0 0 0 1 * *",async() => {
  try{
    await Stats.create({});
  }catch(error){
    console.log(error);
  }
});

app.listen(process.env.PORT , () => {
 console.log(`SERVER IS WORKING ON PORT : ${process.env.PORT}`);
});
