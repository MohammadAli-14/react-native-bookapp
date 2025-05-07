import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router=express.Router();

const generateToken=(userId)=>{
  return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"15d"});

}

router.post("/register",async(req,res)=>{
  
try {
  // DELETE users with null usernames (once only)
  await User.deleteMany({ username: null });
  //checking all the fields
  const{email, username,password}=req.body;
  //checking if all of them are being provided
  if (!email?.trim() || !username?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
if(password.length<6){
  return res.status(400).json({message:"Password should be at least 6 characters long"});
}
if(username.length<6){
  return res.status(400).json({message:"Username should be at least 6 characters long"});
}
//check if users already exists
// const existingUser=await User.findOne({$or:[{email},{username}]})
// if(existingUser) return res.status(400).json({message:"User already exists"});

const existingEmail=await User.findOne({email});
if(existingEmail){
  return res.status(400).json({message:"Email already exists"})
}
const existingUsername=await User.findOne({username});
if(existingUsername){
  return res.status(400).json({message:"Username already exists"});
}
//get random number
const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;



//create a user
const user=new User({
  email,
  username,
  password,
  profileImage,
});

await user.save();

const token=generateToken(user._id);
res.status(201).json({
  //sending the token to the client with the provided user information
  token,
  user:{
    id:user._id,
    username:user.username,
    email:user.email,
    profileImage:user.profileImage,
  },
});
} catch (error) {
  console.log("Errors in register route:", error);
  res.status(500).json({message:"Internal Server Error"}); 
}
})
router.post("/login",async(req,res)=>{
    try {
      const {email,password}=req.body;
      if(!email|| !password) return res.status(400).json({message:"All fields are required"});
      //check if user exists
      const user=await User.findOne({email});
      if(!user) return res.status(400).json({message:"Invalid credentials"});
      //check if password is correct
      const isPasswordCorrect=await user.comparePassword(password);
      if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"});

      //generate token
      const token=generateToken(user._id);
      res.status(200).json({
        token,
        user:{
          id:user._id,
          username:user.username,
          email:user.email,
          profileImage:user.profileImage,
        },
      });
      
    } catch (error) {
      console.log("Errors in login route:", error);
      res.status(500).json({message:"Internal Server Error"});
    }
})


export default router;