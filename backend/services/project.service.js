// here giving values for creating project - telling to create

import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

export const createProject = async({
    roomId, name, userId
})=>{
      if(!roomId){
        throw new Error('roomId is required')
    }
    if(!name){
        throw new Error('Name is required')
    }
   

    let project;
    try {
        project = await projectModel.create({
          roomId,
          name,
          users: [userId]
        });
      } catch (error) {
          throw new Error('An error occurred while creating the project');
        }
      

    return project;
}

export const getAllProject = async({userId} )=>{
    if(!userId){
        throw new Error('user is required')
    }

    const allUserProject = await projectModel.find({
        users: userId
    })

    return allUserProject;
}

export const addUserToProject = async({projectId, users, userId})=>{
    if (!projectId) {
        throw new Error('ProjectId is required');
      }
      if (!mongoose.isValidObjectId(projectId)) {
        throw new Error('Invalid ProjectId');
      }
      if (!users || !Array.isArray(users)) {
        throw new Error('users must be an array');
      }
      for (const userId of users) {
        if (!mongoose.isValidObjectId(userId)) {
          throw new Error(`Invalid userId: ${userId}`);
        }
      }

      if(!userId){
        throw new Error('Invalid userId');
      }
    //checking whether current user is present in the project or not
      const project = await projectModel.findOne({
        _id: projectId,
        users: userId
      })

      if(!project){
        throw new Error('user not belong to this project');
      }

      const updateProject = await projectModel.findOneAndUpdate({
        _id: projectId,
      },{
        $addToSet: {
            users:{
                $each: users
            }
        }
      },{
        new: true
      })
    
      return updateProject;
}

export const getProjectId = async({projectId})=>{
  if(!projectId){
    throw new Error('projectId required');
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error('Invalid ProjectId');
  }
  const project = await projectModel.findOne({
    _id: projectId
  }).populate('users')

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

export const checkRoomId = async({roomId})=>{
  if(!roomId){
    throw new Error('roomId required');
  }

  const project = await projectModel.findOne({
    roomId: roomId
  })
  //console.log(project)

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}



export const updateCode = async({projectId, code})=>{
  if(!projectId){
    throw new Error('projectId required');
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error('Invalid ProjectId');
  }
  if(!code){
    throw new Error('code required');
  }

  const project = await projectModel.findOneAndUpdate({
    _id: projectId
  },{
    code: code
  })

  return project;
}