import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{     
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profileImage:{
        type:String,    
        default:""
    },
},{
    timestamps:true
});

//hash passwords before saving users to db
//a pre-save hook on the userSchema. That means this function runs before a User document is saved to the 
// MongoDB database.

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
})

//compare password functions

userSchema.methods.comparePassword=async function (userPassword) {
    //this.pass is the pass that we have in the db
    //userPassword is the password that get from the user login screen
    
    return await bcrypt.compare(userPassword,this.password);
};




const User=mongoose.model("User",userSchema);

export default User;