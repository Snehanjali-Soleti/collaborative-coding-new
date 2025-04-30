// import socket from 'socket.io-client';
// import { io } from 'socket.io-client';

// let socketInstance = null;
// // Initialize the socket connection
// export const initializeSocket = (projectId) => {
//     socketInstance = socket(import.meta.env.VITE_API_URL, {
//         auth: {
//             token: localStorage.getItem('token') // only if the user is authenticated can connect to the socket
//         },
//         query: { 
//             projectId
//         }
//     });
//     return socketInstance;
//     }
// //function is used to listen for incoming messages or events from the server.

// export const receiveMessage = (eventName, data) => { // msg(type of event occured), callback (data received from server)
//     console.log("received",data)
//     socketInstance.on(eventName, data);
// }

// // send message to the server
// export const sendMessage = (eventName, data) => {
//     console.log("send",data)
//     socketInstance.emit(eventName, data);
// }


import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem('token'), // Authenticate the user
  },
});

export default socket;