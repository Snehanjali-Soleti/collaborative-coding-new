import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import socket from '../config/socket';

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to store all messages
  const { user, openChat, setOpenChat } = useContext(UserContext);

  function SyntaxhighlightedCode(props) {
    const ref = useRef (null)
    React.useEffect(() => {
      if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
      }
      }, [ props.className, props.children])
      return <code {...props} ref={ref} />
    }

  useEffect(() => {
    socket.connect();

    socket.on('recieved-msg', (data) => {
      // console.log('recieved-msg:', data);
      appendIncomingMessage(data);
    });

    return () => {
      socket.off('recieved-msg');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (project?.roomId && user?.userName) {
      socket.emit('join', { roomId: project.roomId, username: user.userName });
      // console.log(`Joined room: ${project.roomId} as user: ${user.userName}`);
    }
  }, [project?.roomId, user?.userName]);

  const send = () => {
    if (!message.trim()) return;

    const outgoingMessage = {
      roomId: project.roomId,
      message,
      sender: user.userName,
    };

    socket.emit('send-msg', outgoingMessage);
    appendOutgoingMessage(outgoingMessage);
    setMessage('');
  };

  const appendIncomingMessage = (messageObject) => {
    setMessages((prevMessages) => [...prevMessages, messageObject]);
  };

  const appendOutgoingMessage = (messageObject) => {
    setMessages((prevMessages) => [...prevMessages, messageObject]);
  };

  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full w-1/4 bg-gray-800 flex flex-col relative">
        <header className="flex justify-between p-2 py-3 px-2 w-full bg-gray-600">
          <button
            className="flex flex-row items-center justify-center hover:cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-line"></i>
            <p className="text-sm pl-1">Add collaborator</p>
          </button>
          <button
            className="ml-auto mr-2"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          >
            <i className="ri-group-fill"></i>
          </button>

          <button
            className="px-2 py-1 rounded-full hover:bg-gray-700 transition duration-200"
            onClick={() => setOpenChat(!openChat)}
          >
            <i className="ri-close-fill"></i>
          </button>
        </header>
        <div className="coversaton-area flex-grow flex flex-col overflow-auto">
          <div className="messsage-box flex-grow flex flex-col p-1 gap-1 overflow-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender === user.userName
                    ? 'message-right ml-auto bg-gray-700'
                    : 'message-left mr-auto bg-gray-600'
                } max-w-[300px] flex flex-col p-2 rounded-md`}
              >
                <small className="opacity-80 text-xs">{msg.sender}</small>
                <p className="text-sm">
                  {msg.sender === 'AI' ? (
                    <div className='overflow-auto bg-gray-900 p-2 rounded-md'>
                    <Markdown>{msg.message}</Markdown>
                    </div>
                  ) : (
                    msg.message
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="input-field w-full flex">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-2 px-4 w-full border-none outline-none text-gray-800"
            type="text"
            placeholder="Enter message"
          />
          <button
            className="p-2 px-4 bg-gray-600 text-white"
            onClick={send}
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center absolute"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-600 p-6 rounded-lg shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Select Users</h2>
            <div className="users flex flex-col gap-1 max-h-60 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user flex items-center hover:bg-gray-700 p-3 rounded cursor-pointer ${
                    selectedUserIds.includes(user._id) ? 'bg-slate-200' : ''
                  }`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="bg-gray-500 text-white aspect-square w-8 h-8 flex justify-center items-center rounded-full">
                    <i className="ri-user-fill"></i>
                  </div>
                  <div className="username pl-2">{user.email}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-gray-700 transition duration-200"
                onClick={handleAddCollaborators}
              >
                Add collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;