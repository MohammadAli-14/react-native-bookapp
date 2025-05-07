import express from 'express'
import "dotenv/config";
import cors from 'cors';
import job from './lib/cron.js';

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from './lib/db.js';
const app=express();    
//Creating the middleware here
app.use(express.json());
const PORT=process.env.PORT ||3000;

job.start(); // Start the cron job
app.use("/api/auth",authRoutes);
app.use("/api/books",bookRoutes);
app.use(cors());


app.listen(PORT,()=>{
 console.log(`Server is listening on port:${PORT}`);
 connectDB();   
});