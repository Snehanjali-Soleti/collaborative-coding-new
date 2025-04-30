// here we r creating project - settings, any operations

import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import {validationResult} from 'express-validator'

export const createProject = async(req, res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const {name, roomId} = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email});
        const userId = loggedInUser._id;
        //console.log(loggedInUser)
        const newProject = await projectService.createProject({roomId, name, userId});

        res.status(201).json(newProject);
    }
    catch(error){
        console.log(error)
        res.status(400).send(error.message);
    }
}

export const getAllProject =async( req, res)=>{
    try{
        const {name} = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email});
        const userId = loggedInUser._id;
        //console.log(loggedInUser)
        const allUserProject = await projectService.getAllProject({userId});
        res.status(201).json(allUserProject);
    }
    catch(error){
        console.log(error)
        res.status(400).send(error.message);
    }
}

export const addUserToProject = async(req, res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const {projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email});
        const userId = loggedInUser._id;
        //console.log(loggedInUser)
        const project = await projectService.addUserToProject({projectId, users, userId});
        res.status(201).json({project});
    }
    catch(error){
        console.log(error)
        res.status(400).send(error.message);
    }
} 

export const getProjectId= async(req, res) =>{
    
    const {projectId} = req.params;
    try{
        const project = await projectService.getProjectId({projectId});
        res.status(200).json({project})
    }catch(err){
        console.log(err)
        res.status(400).send(err.message);
    }
}

export const checkRoomId = async(req, res) =>{
    const {roomId} = req.params;
    try{
        const project = await projectService.checkRoomId({roomId});
        if(project){
            return res.status(200).json({exists: true, project: project});
        }
        return res.status(200).json({exists: false});
    }catch(err){
        console.log(err)
        res.status(400).send(err.message);
    }
}

export const joinProject = async(req, res) =>{
       
      const { roomId, userName } = req.body;
     //onsole.log("Request received:", { roomId, userName }); // Debugging log
    
    
      try {
        // Find the project by roomId
        const project = await projectModel.findOne({ roomId });
    
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }
    
        // Find the user by userName
        const user = await userModel.findOne({ userName: userName }); // Adjust the field name if necessary
       //onsole.log(user);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Add the user's ObjectId to the project's users array if not already added
        if (!project.users.includes(user._id)) {
          project.users.push(user._id);
          await project.save();
        }
    
        // Populate the users array to return detailed user information
        const updatedProject = await projectModel.findOne({ roomId }).populate('users');
    
        res.status(200).json(updatedProject);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    };


export const updateCode = async(req, res) =>{
    const {projectId} = req.params;
    const {code} = req.body;
    try{
        const project = await projectService.updateCode({projectId, code});
        res.status(200).json({project})
    }catch(err){
        console.log(err)
        res.status(400).send(err.message);
    }
}
