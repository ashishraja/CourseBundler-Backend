import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import { Stats } from "../Models/Stats.js";

export const  getDashboardStats = catchAsyncErrors(async (req,res,next) => {

    const stats  = await Stats.find().sort({createdAt:"desc"}).limit(12);

    const statsData = [];

    for(let i=0;i<stats.length;i++){
        statsData.push(stats[i]);
    }
    
    const requiredSize = 12 - stats.length;

    for(let i=0;i<requiredSize;i++){
        statsData.unshift({
            users:0,
            subscription:0,
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
})