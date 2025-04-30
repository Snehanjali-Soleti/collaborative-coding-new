import userModel from '../models/user.model.js';
import * as userService from '../services/user.services.js';
import { validationResult} from 'express-validator';
import redisClient from '../services/redis.service.js';


export const createUserController = async(req , res)=>{
    const errors = validationResult(req);
   //onsole.log(errors)

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
       //cnsole.log(req.body)
        const user = await userService.createUser(req.body); //returns the data in json format
      //  console.log(user)
        const token = await user.generateJWT();

        delete user._doc.password //not to store password in database
        res.status(201).json({user, token});
    }
   catch(error){
    res.status(400).send(error.message);
   }   
}

export const loginController = async(req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({errors: errors.array()});
    }

    try{
        const {email, password} = req.body;
        //console.log(email)
        const user = await userModel.findOne({email}).select('+password'); // bcz here we kept password as selevt : false
        //console.log(user)
        if(!user){
            return res.status(401).json({errors: 'invalid credentials'})
        }
        const ismatch = await user.isValidPassword(password);

        if(!ismatch){
            return  res.status(401).json({errors: 'invalid credentials'})
        }

        const token = await user.generateJWT();

        delete user._doc.password //not to display
       
        res.status(201).json({user, token});
    }
    catch(error){
        console.log(error)
        res.status(400).send(error.message);
    }
}

export const profileController = async(req, res) =>{
    try{
    res.status(200).json({user: req.user});
    }
    catch(error){
        console.log(error)
        res.status(400).sen({error: 'no body'})
    }
}

export const logoutController = async(req,res)=>{
    try{
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        redisClient.set(token, 'logout', 'EX', 60*60*20);
        res.status(200).json({
            message: 'Logged out successfully'
        });
    }
    catch(error){
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getAllUsers = async(req, res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({userId : loggedInUser._id})
        return res.status(200).json({
            users:allUsers
        })
    }
    catch(error){
        console.log(error);
        res.status(400).send(error.message);
    }
}