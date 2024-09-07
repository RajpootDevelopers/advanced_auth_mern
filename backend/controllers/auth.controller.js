import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {User} from "../models/user.model.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {

    const {email, password, name} = req.body;

    try{
        if( !email || !password || !name ){
            return res.status(400).json({message : "All fields are required"});
        }

        const userAlreadyExists = await User.findOne({email});

        if(userAlreadyExists){
            return res.status(400).json({message : "User already exists", success : false});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken=  Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password : hashedPassword,
            name,
            verificationToken,
            verificationTokenExpireAt : Date.now() + 15 * 60 * 1000 
        })

        await user.save(); 

        // jwt
        generateTokenAndSetCookies(res, user._id)
        
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success : true,
            message : "User created successfully",
            user : {
                ...user._doc,
                password : undefined
            }
        })

    }catch(err){
        console.error("Error: ", err.message);
        res.status(400).json({message : err.message, success : false});
    }
}

export const verifyEmail = async (req, res) =>{
    // _ _ _ _ _ _
    const { code } = req.body;

    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpireAt: { $gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message : "Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpireAt = undefined;
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        res.status(200).json({success: true, message : "Email verified successfully"});

    }catch(error){
        console.error("Error in verification email ", error.message);
        // throw new Error(`Error in verification email: ${error}`);
        res.status(500).json({message: `Error in verification email: ${error.message}`, success : false});
    }
}
export const login = async (req, res) => {
    const {email, password} = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({message : "Please! fill all fields", success : false});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message : "User does not exist", success : false});
        }
        if(!user.isVerified){
            return res.status(400).json({message : "Please verify your email", success : false});
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message : "Invalid credentials", success : false});
        }

        // jwt
        generateTokenAndSetCookies(res, user._id)

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({
            success : true, 
            message : "Logged in successfully",
            user : {
                ...user._doc,
                password : undefined,
                resetPasswordToken : undefined,
                resetPasswordExpireAt : undefined
            }
        });

    }catch(error){
        console.error("Error: ", error.message);
        res.status(500).json({message : "server error please try again later", success : false});
    }
}
export const logout = async (req, res) => {
    try{
        res.clearCookie("token",
            {
                httpOnly : true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/"
            });
        // sending response
        res.status(200).json({success : true, message : "Logged out successfully"});   

    }catch(error){
        console.error("error in logout", error.message)
        res.status(500).json({success : false, message : "Logout failed please try again."})
    }
}

export const forgotPassword = async (req, res)=>{

    const {email} = req.body;

    try{
        const user = await User.findOne({email});
        // const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        // const hashedResetToken = await bcryptjs.hash(resetToken, 10);
        // user.resetPasswordToken = hashedResetToken;
        // user.resetPasswordExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        // await user.save();
        // await sendResetPasswordEmail(user.email, resetToken);
        // res.status(200).json({success : true, message : "Reset password token sent to your email"});    

        if(!user){
            return res.status(400).json({message: "User does not exist", success: false})
        }
        // Generate Reset Token

        const resetPasswordToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpireAt = Date.now() + 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken= resetPasswordToken;
        user.resetPasswordExpireAt= resetPasswordExpireAt;
        await user.save();

        // Send Forgot Password Email : 
        
        await sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);
        res.status(200).json({success : true, message : "Reset password link sent to your email"});



    }catch(error){
        console.error("Error: ", error.message);
        res.status(400).json({message : "Error in forgot password", success : false});
    }


}

export const resetPassword = async (req, res) =>{
    try{
        const { token } = req.params;
        const {password} = req.body;
        console.log(token, req.body)

        // if(!password || !confirmPassword){
        //     return res.status(400).json({message : "Please fill all fields", success : false});
        // }
        // if(password !== confirmPassword){
        //     return res.status(400).json({message : "Passwords do not match", success : false});
        // }

        const user = await User.findOne({
            resetPasswordToken : token, 
            resetPasswordExpireAt : {$gt : Date.now()}
        });
        
        if(!user){
            return res.status(400).json({ success: false, message: "Invalid or expired reset token"})
        }
        
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpireAt = undefined;
        await user.save()
        await sendResetSuccessEmail(user.email)
        res.status(200).json({message: "Password Reset Successfuly", success: true})

    }catch(error){
        console.error("Error in reset password! ", error.message)
        res.status(400).json({message: "Error Occured in reset password", success: false})
    }

}

export const checkAuth = async (req, res) => {
    try{
        // const user = await User.findOne({_id : req.userId});
        const user = await User.findById(req.userId).select("-password")
        if(!user) return res.status(404).json({message : "User not found", success : false});
        res.status(200).json({user, success : true});
    }catch(err){
        console.error("Error: ", err.message);
        res.status(500).json({message : "Server error", success : false});
    }
}