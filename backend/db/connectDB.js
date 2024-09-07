import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to MongoDB: ${connect.connection.host}`);

    }catch(error){
        console.log("Error to connect MongoDB ", error);
        process.exit(1); // 1 = failure 0 = success
    }
}

export default connectDB;