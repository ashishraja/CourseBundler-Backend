import { catchAsyncErrors } from "../Middleware/catchAsyncErrors.js";
import { User } from "../Models/User.js";
import { Payment } from "../Models/Payment.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { razorpayInstance } from "../server.js";
import crypto from 'crypto';

export const buySubscription = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role === "admin") {
      return next(new ErrorHandler("Admin does not need to buy the subscription"), 400);
    }
    
    const planId = process.env.PLAN_ID;
    
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(201).json({
      success: true,
      subscriptionId : subscription.id,
    });

  } catch (error) {
    console.error('Error in buying Subscription:', error);
    next(error);
  }
});


const KEY_SECRET = process.env.KEY_SECRET;
const REFUND_DAYS = process.env.REFUND_DAYS;


export const paymentVerification = catchAsyncErrors(async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;
    const user = await User.findById(req.user._id);
    
    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionId}`, "utf-8")
      .digest("hex");
    
    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`);
  } catch (error) {
    console.error('Error in payment verification:', error);
    next(error);
  }
});



export const getRazorPayKey = catchAsyncErrors(async (req, res, next) => {
    
    res.status(200).json({
      success: true,
      key:process.env.KEY_ID,
    });

});

export const cancelSubscription = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id ;

  await razorpayInstance.subscriptions.cancel(subscriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id:subscriptionId,
  });

  let refund;

  const gap = Date.now() - payment.createdAt;
  const refundTime = process.env.REFUND_DAYS*24*60*60*1000;

  if(refundTime>gap){
    await razorpayInstance.payments.refund(payment.razorpay_payment_id);
    refund=true;
  }else{
    refund=false;
  }

  await payment.deleteOne();
  user.subscription.id = undefined;
  user.subscription.status = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message:
    refund ?
    "Subscription Cancelled , you will recieve the refund amount within 7days":
    "No refund will be Initiated because you have cancelled the Subscription after the given cancellation time"
  });

});