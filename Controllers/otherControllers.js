import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import { Stats } from "../Models/Stats.js";
import PDFDocument from "pdfkit";
// import buildPDF from "../service/pdf-service.js";
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);
    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
        statsData.push(stats[i]);
    }

    const requiredSize = 12 - stats.length;

    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users: 0,
            subscription: 0,
            views: 0
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

    if (statsData[10].users === 0) usersPercentage = usersCount * 100;
    if (statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount * 100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;

    else {
        const difference = {
            users: usersCount - statsData[10].users,
            subscription: subscriptionCount - statsData[10].subscription,
            views: viewsCount - statsData[10].views,
        };

        usersPercentage = (difference.users / statsData[10].users * 100);
        subscriptionPercentage = (difference.users / statsData[10].subscription * 100);
        viewsPercentage = (difference.users / statsData[10].views * 100);

        if (usersPercentage < 0) usersProfit = false;
        if (subscriptionPercentage < 0) subscriptionProfit = false;
        if (viewsPercentage < 0) viewsProfit = false;
    }

    // Construct response data
    const responseData = {
        success: true,
        stats: statsData,
        usersCount,
        subscriptionCount,
        viewsCount,
        usersPercentage,
        subscriptionPercentage,
        viewsPercentage,
        usersProfit,
        subscriptionProfit,
        viewsProfit,
    };

    // Send the response
    res.status(200).json(responseData);
});



export const download = (req, res, next) => {

    const { courseName = "Offline Blouse Mastery Program At Surat", organizationName = "Raja Rani Coaching", courseProviderName = "Jash Gotawala", userName = "Ashish Santani" } = req?.query;

    function buildPDF(courseName, organizationName, courseProviderName, userName, dataCallback, endCallback) {
        const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });
    
    
        doc.on('data', dataCallback);
        doc.on('end', endCallback);
    
        doc.font('Helvetica-Bold').fontSize(28).text('CERTIFICATION OF COMPLETION', { align: 'center' });
    
        doc.font('Helvetica');
    
        doc.moveDown(0.5);
        doc.fontSize(16).text(`This is to certifies that`, { align: 'center' });
    
        doc.moveDown(0.5);
        doc.fontSize(25).text(`${userName}`, { align: 'center' });
    
        doc.moveDown(0.5);
        doc.fontSize(16).text(`has successfully completed the ${courseName} offered by ${organizationName} in association with `, { align: 'center' });
        doc.fontSize(16).text(` ${courseProviderName}`, { align: 'center' });
    
        doc.moveDown(1);
        doc.fontSize(14).text(`Date of Issue: ${new Date().toLocaleDateString()}`, { align: 'left' });
    
        doc.moveUp(1).fontSize(14).text(`${organizationName}`, { align: 'right' });
    
        doc.end();
    }
    
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
    });
    pdfService.buildPDF(
        courseName,
        organizationName,
        courseProviderName,
        userName,
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

// export const download = (req, res, next) => {
//     const { courseName = "Offline Blouse Mastery Program At Surat", organizationName = "Raja Rani Coaching", courseProviderName = "Jash Gotawala", userName = "Ashish Santani" } = req?.query;

//     // Create the PDF stream
//     const stream = pdfService.buildPDF(
//         courseName,
//         organizationName,
//         courseProviderName,
//         userName
//     );

//     // Pipe the PDF stream to the response
//     stream.pipe(res);

//     // Handle errors
//     stream.on('error', (err) => {
//         console.error(err);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     });
// };


// export const download = (req, res, next) => {
//     const { courseName = "Offline Blouse Mastery Program At Surat", organizationName = "Raja Rani Coaching", courseProviderName = "Jash Gotawala", userName = "Ashish Santani" } = req?.query;

//     const stream = buildPDF(
//         courseName,
//         organizationName,
//         courseProviderName,
//         userName,
//     );

//     stream.pipe(res);

//     // Handle errors
//     stream.on('error', (err) => {
//         console.error(err);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     });
// };


function buildPDF(courseName, organizationName, courseProviderName, userName, dataCallback, endCallback) {
    const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });


    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.font('Helvetica-Bold').fontSize(28).text('CERTIFICATION OF COMPLETION', { align: 'center' });

    doc.font('Helvetica');

    doc.moveDown(0.5);
    doc.fontSize(16).text(`This is to certifies that`, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(25).text(`${userName}`, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(16).text(`has successfully completed the ${courseName} offered by ${organizationName} in association with `, { align: 'center' });
    doc.fontSize(16).text(` ${courseProviderName}`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(14).text(`Date of Issue: ${new Date().toLocaleDateString()}`, { align: 'left' });

    doc.moveUp(1).fontSize(14).text(`${organizationName}`, { align: 'right' });

    doc.end();
}