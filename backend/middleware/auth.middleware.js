import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

export const authUser= async(req, res, next)=>{
    try{
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        //console.log(token)
        if(!token){
            return res.status(401).send({error: 'Please authenticate'})
        }
//token is experied within 24hr generally, token deleted => then it found in redis also not valid , in redis it goes in blacklist.
        const isBlackListed = await redisClient.get(token);

        if(isBlackListed){
            res.cookie('token', ''); // removing from this
            return res.status(401).send({error: 'Please authenticate'})
        }
       
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        //console.log(decoded)
        next();
    }
    catch(error){
        console.log(error)
        res.status(401).send({error: 'Please authenticate'});
    }
}