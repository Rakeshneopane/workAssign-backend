const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const joi = require("joi");
const axios = require("axios");

const email = joi.string().email({tlds:{allow: false} }).required();
const password = joi.string().min(6).required();
const role = joi.string().valid("admin", "user").required();
const team = joi.string().required();

const createUserSchema = joi.object({
    name:  joi.string().min(3).max(50).required(),
    email,
    password,
});

const loginSchema = joi.object({
    email,
    password,
});

const createUser = async(user)=>{
        const createNewUser = await new User(user).save();
        return createNewUser;
}

exports.userSignup = async( req,res,next )=>{
    try {
        const { error, value } = createUserSchema.validate(req.body);
        if(error){
            return res.status(400).json({error: error.details[0].message});
        }
        const { name, email, password } = value;
        
        const alreadyExist = await User.findOne({email});
        if(alreadyExist){
            return res.status(409).json({error: `User already exist`});
        }

        const hashedPassword = await bcrypt.hash(password,10);
        value.password = hashedPassword;
        const newUser = await createUser(value);

        const token = jwt.sign(
            {id: newUser._id, role: newUser.role},
            process.env.secretKey,
            {expiresIn: "3d"}
        )

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email, 
            role: newUser.role, 
        }

        return res
            .status(201)
            .json({
                message: "User Created succesfully",
                token, 
                user: userResponse
            });

    } catch (error) {
        next(error);
    }
}

exports.userLogin = async( req,res,next )=>{
    try {
        const { error, value } = loginSchema.validate(req.body);
        
        if(error){
            return res.status(400).json({error: error.details[0].message});
        }

        const { email, password } = value;

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: "User not found"});
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({error: "Unauthorized: Incorrect Password"});
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.secretKey,
            {expiresIn: "3d"}
        );

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role, 
                }
            }
        );
    } catch (error) {
         next(error);
    }
}

exports.getMe = async( req,res,next )=>{
    try {
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(400).json({
                error: "User not found."
            });
        }
        const userResponse = { 
            _id: user._id, 
            name: user.name, 
            email: user.email 
        };
        res.status(200).json({
            message: "User Found successfully", 
            user: userResponse
        })
    } catch (error) {
        next(error);
    }
}

exports.getAll = async( req,res,next )=>{
    try {
        if(req.user.role !== "admin"){
                return res.status(403).json({
                error: "Access denied: Admin only"
            });
        }
        
        const users = await User.find().select("_id name email");;

        if(users.length === 0 ){
            return res.status(400).json({
                error: "Users not found."
            });
        }
        
        res.status(200).json({
            message: "Users Found successfully", 
            users
        })
    } catch (error) {
        next(error);
    }
}


const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://work-assign-frontend.vercel.app'
  : 'http://localhost:5173';

exports.google = (req,res, next)=>{
    try {
        const googleUrl =  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&scope=email profile&response_type=code`;

        res.redirect(googleUrl);
    } catch (error) {
        next(error);
    }
}

exports.googleCallback = async(req,res, next)=>{
    
    try {
        const {code} = req.query;
        if(!code) {
            return res.status(400).json({error: "Authorization is not provided."});
        }

        const tokenResponse = await axios.post(`https://oauth2.googleapis.com/token`,{
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret : process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_CALLBACK_URL
        },{
            headers: {"Content-Type": "application/x-www-form-urlencoded"}
        })

        const accessToken = tokenResponse.data.access_token;

        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo",
            {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        const { name, email } = userInfo.data;

        const filter = {email};
        const update = {
            $set : {name},  
            $setOnInsert: { role: "user" } 
        };
        const existingUser = await User.findOneAndUpdate( 
            filter, 
            update, 
            { new: true, upsert: true }
        );

        const {_id} = existingUser;

        const jwtToken = jwt.sign(
            { id: existingUser._id, role: existingUser.role }, 
            process.env.secretKey, 
            {expiresIn: '3d'}
        );

        const refreshJWTToken = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.refreshSecretKey, 
            {expiresIn: '7d'}
        );

        await User.findByIdAndUpdate(_id,{
            refreshToken: refreshJWTToken
        })

        res.cookie("jwt_token", jwtToken, {  // access token
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 15 * 60 * 1000  // 15 minutes
        });
        res.cookie("refresh_token", refreshJWTToken, {  // refresh token
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        });
        return res.redirect(`${FRONTEND_URL}/oauth-callback`);       
    } catch (error) {
        next(error);
    }
};

exports.refresh = async(req, res, next)=>{
    try {
        const refreshToken = req.cookies?.refresh_token; 
        if (!refreshToken) {
            return res.status(401).json({error: "No refresh token"});
        }

        const decoded = jwt.verify(refreshToken, process.env.refreshSecretKey);
        
        // verify token exists in DB
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken)
            { 
                return res.status(403).json({error: "Invalid refresh token"});
            }

        const accessToken = jwt.sign(
            { id: decoded.id, role: user.role },
            process.env.secretKey,
            { expiresIn: '15m' }
        );

        res.cookie("jwt_token", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 15 * 60 * 1000
        });

        return res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        next(error);
    }
}

exports.logout = async(req,res,next)=>{
    try {
        const token = req.cookies?.jwt_token;
        if (token) {
            try {
                const verified = jwt.verify(token, process.env.secretKey);
                await User.findByIdAndUpdate(verified.id, { refreshToken: null });
            } catch (err) {
                // Access token expired/invalid, try refresh token
                const refreshToken = req.cookies?.refresh_token;
                if (refreshToken) {
                    try {
                        const decoded = jwt.verify(refreshToken, process.env.refreshSecretKey);
                        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
                    } catch (rErr) {}
                }
            }
        }
    } catch (error) {
        // Ignore DB update errors during logout
    } finally {
        res.clearCookie("jwt_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        return res.json({message: " Logout successful "});
    }
}
