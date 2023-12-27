import mongoose from "mongoose";


export const connectDatabase = async () => {
mongoose.connect(process.env.DB_URI).then((data) => {
    console.log(`mongodb is connected with the server : ${data.connection.host}`);
})
}



