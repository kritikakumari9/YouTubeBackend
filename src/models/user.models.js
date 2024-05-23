import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

 const userSchema= new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
            },
    fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
            },
            
     avatar:{
                type:String,// cloudinary url
                required:true,
                
                    },  
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken: {
        type:String
    }
 }, {timestamps:true})
 
 // 2nd argument i.e. callback func is async because encryption of password takes some time and we will not use 
//  arrow function becuase arrow function has no this reference and here we need this referece

//using pre hook to create our own middleware
 userSchema.pre("save",async function(next){ // pre hook used to encrypt password just before its saved
    if(!this.isModified("password")) return next();// this.isModified(Parameter_name)
    // if password is not changed then below code will not run
    //if  not used this then any detail like avatar,  email etc will change it will reencrypt password because below codes will run
    // but we want this only when password is first enterd
    // or when password is changed
    this.password=bcrypt.hash(this.password,10)
    next()
 })

 userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
 }

 userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            // payloads that it will take
            // lhs payload name . rhs value from database
            _id: this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }
 userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            // payloads that it will take
            // lhs payload name . rhs value from database
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }
 


  
 
 export const User=mongoose.model("User", userSchema)