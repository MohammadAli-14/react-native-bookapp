import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Books.js"
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/",protectRoute,async()=>{
    try {
        const {title,caption,rating,image}=req.body;        
        //checking if all of them are being provided
        if(!image|| !title || !caption || !rating){
            return res.status(400).json({message:"All fields are required"});
        }
        //upload the image to the cloudinary
        const uploadResponse=await cloudinary.uploader.upload(image);
        const imageUrl=uploadResponse.secure_url;
        //save to db
        const newBook=new Book({
            title,
            caption,
            image:imageUrl,
            rating,
            //user:req.user._id,
        });
        await newBook.save();
        //we have send a response so 201 will be better 
        res.status(201).json(newBook);

    } catch (error) {
        console.log("Errors in create book route:",error);
        res.status(500).json({message:error.message});
    }
});
//pagination=>infinite loading

router.get("/",protectRoute,async()=>{
 try {
    //example call from react-native-frontend
    //const response=await fetch("http://localhost:3000/api/books?page=1&limit=5");
    const page=req.query.page ||1;
    const limit=req.query.limit ||5;
    const skip=(page-1)*limit;
    const books=await Book.find().sort({createdAt:-1}) //descending order from newest one to  //the older and so on
    .skip(skip)
    .limit(limit)
    .populate("user","username profileImage");

    const totalBooks=await Book.countDocuments();

    res.send({
        books,
        currentPage:page,
        totalBooks,
        totalPages:Math.ceil(totalBooks/limit),
    });
 } catch (error) {
    console.log("Error in getting all book route",error);
    res.status(500).json({message:"Internal Server Error"});
 }
})
router.delete("/:id",protectRoute,async(req,res)=>{
    try {
        const book=await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message:"Book not found"});
        //check if the user is the creator of the book
        if(book.user.toString()!==req.user._id.toString()){
            return res.status(401).json({message:"You are not authorized to delete this book"});
        }
        
        //delete the image from cloudinary
        //example imagr url how cloudinary stores yr image
        //https://res.cloudinary.com/de1rm4uto/image/upload/v17411568358/qyup61vejflxxw8igvi0.png

        if(book.image && book.image.includes("cloudinary")){
            try {
                const imageId=book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(imageId);
                
            } catch (error) {
                console.log("Error in deleting image from cloudinary",error);
                return res.status(500).json({message:"Internal Server Error"});
                
            }
        }
        //delete the book from db
        await book.deleteOne();

        res.json({message:"Book deleted successfully"});
    } catch (error) {
        console.log("Error in deleting book route",error);
        res.status(500).json({message:"Internal Server Error"});
    }
    


});
//get recommended books by the logged in user
router.get("/user",protectRoute,async(req,res)=>{
    try {
        const books=await Book.find({user:req.user._id}).sort({createdAt:-1});
        res.json(books);
    } catch (error) {
        console.log("Error in getting recommended books",error);
        res.status(500).json({message:"Internal Server Error"});
    }
})


export default router;