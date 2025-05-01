// here we are structuring how our model want to be

import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    roomId:{
        type: String,
        required: true,
        trim: true
    },
    name:{
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    code: {
        type: String, // Store the code as a string
      }
})

const Project = mongoose.model('project', projectSchema)

export default Project;