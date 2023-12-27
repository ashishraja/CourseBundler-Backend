import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import { Stats } from "../Models/Stats.js";
import ErrorHandler from "../Utils/errorHandler.js";
import sendEmail from "../Utils/sendEmail.js";

export const contact = catchAsyncErrors(async (req,res,next) => {

    const {name , email , message} = req.body;

    if(!name || !email || !message){
        return next(new ErrorHandler("Please enter all the fields.",404));
    }

    const to = process.env.MY_MAIL;
    const subject = "Contact from CourseBundler";
    const text = `I am ${name} and my email is ${email} \n ${message}` 

    await sendEmail(to,subject,text);

    res.status(200).json({
        success:true,
        message:"Thank you for contacting us. We will comeback to you soon."
    });
});

export const courseRequest = catchAsyncErrors(async (req,res,next) => {

    const {name , email , course} = req.body;

    if(!name || !email || !course){
        return next(new ErrorHandler("Please enter all the fields.",404));
    }

    const to=process.env.MY_MAIL;
    const subject = "Contact from CourseBundler";
    const text = `I am ${name} and my email is ${email} \n ${course}` 

    sendEmail(to,subject,text);

    res.status(200).json({
        success:true,
        message:"Thank you for requesting us. We will comeback to you soon."
    });
});

export const  getDashboardStats = catchAsyncErrors(async (req,res,next) => {

    const stats  = await Stats.find().sort({createdAt:"desc"}).limit(12);

    const statsData = [];

    for(let i=0;i<stats.length;i++){
        statsData.push(stats[i]);
    }
    console.log(stats.length);
    const requiredSize = 12 - stats.length;

    for(let i=0;i<requiredSize;i++){
        statsData.unshift({
            users:0,
            subscriptions:0,
            views:0
        });
    }
    
    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[11].views;

    let usersProfit = true,
     subscriptionProfit = true,
     viewsProfit = true;

     let usersPercentage = 0,
     subscriptionPercentage = 0,
     viewsPercentage = 0;

     if(statsData[10].users === 0) usersPercentage = usersCount * 100;
     if(statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount * 100;
     if(statsData[10].views === 0) viewsPercentage = viewsCount * 100;

     else{
        const difference = {
            users : usersCount - statsData[10].users,
            subscription : subscriptionCount - statsData[10].subscription,
            views : viewsCount - statsData[10].views,
        };

        usersPercentage = (difference.users/statsData[10].users * 100);
        subscriptionPercentage = (difference.users/statsData[10].subscription * 100);
        viewsPercentage = (difference.users/statsData[10].views * 100);

        if(usersPercentage<0) usersProfit = false;
        if(subscriptionPercentage<0) subscriptionProfit = false;
        if(viewsPercentage<0) viewsProfit = false;
     }

    res.status(200).json({
        success:true,
        stats:statsData,
        usersCount,
        subscriptionCount,
        viewsCount,
        usersPercentage,
        subscriptionPercentage,
        viewsPercentage,
        usersProfit,
        subscriptionProfit,
        viewsProfit,
    });
});