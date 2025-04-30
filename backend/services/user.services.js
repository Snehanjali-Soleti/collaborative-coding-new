import userModel from '../models/user.model.js';


export const createUser = async({
    userName, email, password
})=>{
   console.log(userName, email, password)
    if(!userName || !email|| !password){
        throw new Error('userName, email and password are required');
    }

    const existingUserName = await userModel.findOne({ userName });
    if (existingUserName) {
        throw new Error('userName is already in use');
    }

    // Check if the email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new Error('Email is already in use');
    }
    const hashedPassword = await userModel.hashPassword(password);
    //console.log(hashedPassword)
    const user = await userModel.create({
        userName,
        email, 
        password: hashedPassword
    });

    return user;
}
 
export const getAllUsers = async({userId})=>{
    const users= await userModel.find({
        _id: {$ne: userId}
    });
    return users;
}