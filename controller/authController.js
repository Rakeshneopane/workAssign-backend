const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const joi = require("joi");

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