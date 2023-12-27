class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.status = statusCode;

        Error.captureStackTrace(this,this.constructor);
    }
}

export default ErrorHandler;

//here i have created the errorHandler class which inherits all the properties of the 
//error(parent's class) class.. this class consists of the constructor that takes two parameters 
//that is message and statuscode.
//here super keyword is used to call the error class constructor with the message parameter.
//error.capturestacktrace is used to trace the error..it provides clear trace of the error 
//and therefore it is very useful for debugging the code...
//and finally module.exports is used to export the class..
//NOTE : constructor is a special method which is called whenever a new instance of the class is created(ie:oject).
