import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6, 'Email must be atleast 6 characters long'],
        maxLength: [50, 'Email must not be longer tan 50  character']
    },
    password: {
        type: String, // Directly set the type as String
        required: true, // Ensure password is required
        select: false, // Exclude password by default from queries
    },
})


userSchema.statics.hashPassword = async function (password){
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function (password){
    //console.log('Comparing:', password, 'with:', this.password);
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function() {
    return jwt.sign({email: this.email}, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);

export default User;