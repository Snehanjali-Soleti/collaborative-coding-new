import React, { useState, useEffect, useContext } from "react";
import Editor from "@monaco-editor/react";
// import io from "socket.io-client";
import { UserContext } from '../context/user.context';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Project  from "./Project";
import UserAuth from "../auth/UserAuth";

// const socket = io("http://localhost:3000");

import socket from "../config/socket";

const CollaborateCoding = () => {
  const location = useLocation();
  const [copySuccess, setCopySuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("//start code here");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState("*");
  const [project, setProject] = useState(location.state?.project);
  const [roomId, setRoomId] = useState(project?.roomId);

  const { user, openChat, setOpenChat } = useContext(UserContext); // we are using details of logged-in user
  const [username, setUsername] = useState(user.userName);
  

   const navigate = useNavigate();

   useEffect(() => {
    if (!roomId || !code) return;
  
    axios
      .put(`/projects/update-code/${roomId}`, { code })
      .then((res) => {
        console.log('Code saved:', res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [roomId, code]); // Run only when roomId or code changes


  useEffect(() => {
    // Automatically join the room when the component is mounted
    if (roomId && username) {
      joinRoom();
    }
  }, [roomId, username]);

  useEffect(() => {
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("updateInput", (newInput) => setUserInput(newInput));
    socket.on("userJoined", (users) => setUsers(users));
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));
    socket.on("codeResponse", (response) => setOutput(response.run.output));

    return () => {
      socket.off("codeUpdate");
      socket.off("userJoined");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("updateInput");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => socket.emit("leaveRoom");
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  const handleCodeChange = (newCode) => {
    //console.log("Code changed:", newCode);
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, username });
  };

  const handleInputChange = (e) => {
    const newInput = e.target.value;
    setUserInput(newInput);
    socket.emit("inputChange", { roomId, input: newInput });
  };



  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", {
      roomId,
      code,
      language,
      version: version || "*",
      input: String(userInput),
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const joinRoom = () => {
    if (roomId && username) {
      socket.emit("join", { roomId, username });
      //console.log("Joined room:", roomId, "as user:", username);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setRoomId("");
    setUsername("");
    setLanguage("javascript");
    setCode("//start code here");
    navigate('/');
  };

  

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {openChat && (<div className={`w-1/4 m-0 h-full absolute transition-all duration-300`}>
            <UserAuth><Project project ={project}/></UserAuth>
        </div>)}
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 p-4 flex flex-col gap-6 ">
        <div className="room-info">
          <h2 className="text-xl font-bold mb-2">Project: {project.name}</h2>
          <p className="text-medium font-medium mb-2">Code Room: {project.roomId}</p>
          <button
            onClick={copyRoomId}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Copy Id
          </button>
          {copySuccess && (
            <span className="text-green-400 text-sm mt-2 block">
              {copySuccess}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Users in Room:</h3>
          <ul className="list-disc list-inside">
            {users.map((user, index) => (
              <li key={index} className="truncate">
                {user.slice(0, 8)}...
              </li>
            ))}
          </ul>
        </div>
        <div className="typing-indicator text-sm italic text-gray-400">
          {typing}
        </div>
        <select
          className="bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>

        {/* Open Chat Button */}
        <button
          className="mt-auto ml-auto px-3 py-2 bg-slate-700 text-white text-lg rounded hover:bg-slate-600 transition duration-200"
          onClick={() => setOpenChat(!openChat)}
          
        >
          <i className="ri-wechat-line"></i>
        </button>

        
      

        {/* Leave Room Button */}
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          onClick={leaveRoom}
        >
          Leave Room
        </button>
      </div>

      {/* Editor and Console */}
      <div className="w-3/4 p-2 flex flex-col gap-2">
        <Editor
          height="60%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14 }}
          className="rounded border border-gray-700"
        />
       <div className="relative">
            <textarea
              className="w-full h-[1/5] bg-gray-800 text-white p-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Enter input here..."
            >
            </textarea>
            <button
              className="absolute mb-2 bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
              onClick={runCode}
            >
              Execute
            </button>
          </div>
        <textarea
          className="w-full h-[180px] bg-gray-800 text-white p-3 rounded border border-gray-700 focus:outline-none"
          value={output}
          readOnly
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );
};

export default CollaborateCoding;