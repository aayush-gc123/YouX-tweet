// import jwt from "jsonwebtoken"
// import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt"

// const userSchema = new Schema({

//     username:{
//         type:String,
//         required:true,
//         unique:true,
//         lowercase:true || false,
//         trim:true, 
//         index:true // for searching 

//     },
//     email:{
//         type:String,
//         required:true,
//         unique:true,
//         lowercase:true ,
//         trim:true, 
       

//     },
//     fullname:{
//         type:String,
//         required:true,
//         unique:true,
//         lowercase:true || false,
//         trim:true, 
//         index:true // for searching 

//     },
//     avatar:{
//         type:String , //cloudinary url
//         required:true
//     },
//     coverImage:{
//         type:String, // cloudinary
//     },
//     watchHistory: [
//         {
//             type:Schema.Types.ObjectId,
//             ref : "Video"
//         }
//     ],
//     password:{
//         type:String,
//         required: [true , "Paaword should required"]
//     },
//     refreshToken:{
//     type:String
//     }
// },{timestamps:true})

// userSchema.pre("save" , async function(next){
//     if(!this.isModified("password")) return next()
//     this.password = await bcrypt.hash(this.password , 10)
//     next()
// })  //when data is saving

// // userSchema.methods.isPasswordCorrect = async function (password){
// //    return await bcrypt.compare(password , this.password)
// // }

// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password);
//   };

// userSchema.methods.generateAccessToken = function(){
//     jwt.sign(
//         {
//             _id:this._id,
//             email:this.email,
//             username:this.username,
//             fullname:this.fullname
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn:process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }
// userSchema.methods.generateRefreshToken = function(){
//     jwt.sign(
//         {
//             _id:this._id,
          
//         },
//         process.env.REFERESH_TOKEN_SECRET,
//         {
//             expiresIn:process.env.REFERESH_TOKEN_EXPIRY
//         }
//     )
// }

// export const User  = mongoose.model("User" , userSchema)


import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";  // Make sure to use `bcryptjs` instead of `bcrypt` for consistency

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // This should be `true` without `|| false`
        trim: true,
        index: true // for searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true // for searching
    },
    avatar: {
        type: String, // cloudinary URL
        required: true
    },
    coverImage: {
        type: String // cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// Method to generate an access token
userSchema.methods.generateAccessToken = function() {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        secret,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'  // Default to 1 day if not set
        }
    );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function() {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    return jwt.sign(
        {
            _id: this._id
        },
        secret,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d'  // Default to 10 days if not set
        }
    );
};

// Method to check if the entered password is correct
userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

export const User = mongoose.model("User", userSchema);
