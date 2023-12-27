export const catchAsyncErrors = (passedFunction) => (req,res,next) => {
    Promise.resolve(passedFunction(req,res,next)).catch(next);
};

//so this is a error-handling middleware which is used to handle the errors.
//func is a arrow-function which is taking another function as an argument which takes the three parameters 
//that is req,res,next ... In that i have used Promise.resolve() which always return a promise....
//and if some error occured while resolving the promise we will catch that error by calling next..
//this arrow-function is known as higher order function.