import 'dotenv/config.js';  // Load environment variables from .env file, ES6 we using

import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';

import { generateResult } from './services/ai.service.js';

const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend's URL
        methods: ["GET", "POST"],
    }
});



// io.use(async(socket, next) => {
//     // Middleware to check if the user is authenticated
//     try {
//         const token = socket.handshake.auth?.token || (socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);
//         const projectId = socket.handshake.query.projectId;
//         if(!mongoose.isValidObjectId(projectId)){
//             return next(new Error('Project ID is required'));
//         }

//         socket.projectId = await projectModel.findById(projectId);
        
//         if (!token) {
//             return next(new Error('Authentication error'));
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         if (!decoded) {
//             return next(new Error('Authentication error'));
//         }
//         socket.user = decoded;
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

const rooms= new Map();
// Your socket.io event handlers here

io.on('connection', (socket) => {

    let currentRoom = null;
    let currentUser = null;

    socket.on("join", ({roomId, username}) => {
        //console.log(roomId, username);
        if(currentRoom){
            socket.leave(currentRoom);
            rooms.get(currentRoom).users.delete(currentUser);
            io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom).users));
        }
        currentRoom = roomId;
        currentUser = username;

        socket.join(roomId);

        if(!rooms.has(roomId)){ // checking if the room is already created or not
            rooms.set(roomId, {users: new Set(), code: "//start code here"});
        }

        rooms.get(roomId).users.add(username);
        socket.emit("codeUpdate", rooms.get(roomId).code); // sending the code to the user who joined the room
        
        io.to(roomId).emit("userJoined",Array.from(rooms.get(currentRoom).users)); // sending the users in the room to all the users in the room
        //console.log(rooms); 
    });
    

    socket.on("codeChange", ({roomId, code}) => {
       // console.log(rooms);
       // console.log(rooms.has(roomId));
        if(rooms.has(roomId)){
            rooms.get(roomId).code = code; // updating the code in the room
        }
        //console.log(code);
        socket.to(roomId).emit("codeUpdate", code);
    });

    socket.on("inputChange", ({roomId, input}) => {
        if(rooms.has(roomId)){
            rooms.get(roomId).input = input; // updating the code in the room
        }
        socket.to(roomId).emit("updateInput", input);

    });

    socket.on("leaveRoom", () => {
        if(currentRoom && currentUser){
            rooms.get(currentRoom).users.delete(currentUser);
            socket.leave(currentRoom);
            io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom).users));
            currentRoom= null;
            currentUser= null;
        }
    });

    socket.on("typing", ({roomId, username}) => {
        socket.to(roomId).emit("userTyping", username);
    });

    socket.on("languageChange", ({roomId, language}) => {
        socket.to(roomId).emit("languageUpdate", language);
    });

    socket.on("compileCode", async ({ roomId, code, language, version, input }) => {
        if (!rooms.has(roomId)) return;  // Return early if room does not exist
    
        const room = rooms.get(roomId);
        if (!room) return;

        //console.log("Compiling code:", code, language, version, input);
    
        try {
            const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
                language,
                version,
                files: [{ content: code }],
                stdin: String(input) || "",  // Ensure input is a string
            });
           // console.log("Response from API:", response.data);
            room.output = response.data.run.output;
            io.to(roomId).emit("codeResponse", response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error executing code";
            io.to(roomId).emit("codeResponse", { run: { output: errorMessage } });
        }
    });
    
    

    socket.on("disconnect", () => {
        if(currentRoom && currentUser){
            rooms.get(currentRoom).users.delete(currentUser);
            io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom).users));
        }
    });

    socket.on('send-msg', async (data) => {
        try {
          const message = data.message;
          const aiIsPresentInMessage = message.includes('@ai');
          const roomId = data.roomId;
    //   console.log(rooms.has(roomId))
    //   console.log("Rooms:", Array.from(rooms.keys()));
          if (!rooms.has(roomId)) {
            console.error('Invalid roomId:', roomId);
            return;
          }

      
          if (aiIsPresentInMessage) {
            // io.to(roomId).emit('recieved-msg', {
            //   message: 'AI is processing your request...',
            //   sender: 'AI'
            // });
      
            const prompt = message.replace('@ai', '');
            const result = await generateResult(prompt);
      
            io.to(roomId).emit('recieved-msg', {
              message: result,
              sender: 'AI'
            });
            return;
          }
      
          socket.broadcast.to(roomId).emit('recieved-msg', data);
        } catch (error) {
          console.error('Error processing message:', error.message);
        }
      });


    // socket.on('project-message', async (data) => {
    //    console.log('Message:', data);
    //    const message = data.message;
    //    const aiIsPresentInMessage = message.includes('@ai');
    //    const roomId = data.roomId
       
    //    if(aiIsPresentInMessage){

    //     const prompt = message.replace('@ai', '');
    //     const result = await generateResult(prompt);

    //         io.to(roomId).emit('project-message', {
    //             message: result,
    //             sender:'AI'
    //         });
    //         // console.log(sender)
    //         // socket.emit('project-message', {  // sockect is used to send message to the same user
    //         //     sender : data.sender,
    //         //     message:'ai need to send it'
    //         // });
    //    return;
    //    }
    //    console.log(roomId)
    //     socket.to(roomId).emit('project-message', data);
    // });

//     socket.on('project-message', async(data) => {

//         console.log('Message:', data);
//         const message = data.message;   
//         const aiIsPresentInMessage = message.includes('@ai');   
//         if(aiIsPresentInMessage){
//             const prompt = message.replace('@ai', '');
//             const result = await generateResult(prompt);
//             socket.emit('project-message', {
//                 message: result,
//                 sender:'AI'
//             });
//             return; 
//         }
//         socket.broadcast.to(roomId).emit('project-message', data);
//     }
// );

    socket.on('event', data => { /* … */ });
    // socket.on('disconnect', () => { 
    //     socket.leave(socket.roomid);
    // });
  });   
  

const PORT =  3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});