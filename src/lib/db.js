import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connnected ${conn.connection.host}`);
        
    } catch (error) {
        console.log("Error connecting to the database",error);
        process.exit(1); //Failure  
    }
};


//MONGO_URI=mongodb+srv://aliking:ali789@cluster0.w7anxrz.mongodb.net/books_db?retryWrites=true&w=majority&appName=Cluster0