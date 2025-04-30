import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from "uuid";


const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const [roomId, setRoomId] = useState("");
  const [isProjectNameEditable, setIsProjectNameEditable] = useState(true); // New state to control editability


  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const { user } = useContext(UserContext);
  const [userName, setUserName] = useState(user.userName);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openProject = () => setIsProjectOpen(true);
  const closeProject = () => {
    setIsProjectOpen(false);
    setRoomId(""); // Reset roomId
    setProjectName(""); // Reset projectName
    setIsProjectNameEditable(true); // Reset editability
  };

  const navigate = useNavigate();



  useEffect(() => {
    if (!user || !user._id) return; // Ensure user and user._id are available
  
    axios
      .get('projects/all')
      .then((res) => {
        console.log(res.data);
        // Filter projects where the current user's _id is included in the users array
        const filteredProjects = res.data.filter((project) =>
          project.users.includes(user._id)  // Match current user's _id
        );
        setProjects(filteredProjects);
        console.log(projects)
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user._id]); // Dependency on user._id



  const createRoomId = () => setRoomId(uuid());

  const handleRoomIdChange = (e) => {
    const enteredRoomId = e.target.value;
    setRoomId(enteredRoomId);

    if (enteredRoomId) {
      // Check if the roomId exists
      axios
        .get(`/projects/check-room/${enteredRoomId}`)
        .then((res) => {
          console.log(res.data);
          if (res.data.exists) {

            setProjectName(res.data.project.name); // Auto-populate project name
            setIsProjectNameEditable(false); // Make project name non-editable
          } else {
            setProjectName(""); // Clear project name if roomId doesn't exist
            setIsProjectNameEditable(true); // Make project name editable
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setProjectName(""); // Reset project name if roomId is cleared
      setIsProjectNameEditable(true); // Make project name editable
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (isProjectNameEditable) {
      // Create a new project
      axios
        .post('/projects/create', {
          name: projectName,
          roomId: roomId,
        })
        .then((res) => {
          setProjects([...projects, res.data]); // Add the new project to the list
          closeProject(); // Close the modal
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // Join an existing project
      axios
        .post('/projects/join', {
          roomId: roomId,
          userName: userName, // Add the current user to the project's users
        })
        .then((res) => {
          console.log('Joined project:', res.data);
          navigate('/code', {
            state: { project: res.data }, // Navigate to the existing project
          });
          closeProject(); // Close the modal
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Handle project creation logic here
  //   // console.log('Project Name:', projectName);
  //   axios.post('/projects/create',{
  //     name: projectName,
  //     roomId: roomId,
  //   }).then((res)=>{
  //     //console.log(res.data)
  //     setProjects([...projects, res.data])
  //     closeModal();
  //     closeProject();
  //   })
  //   .catch((error)=>{
  //     console.log(error)
  //   })
    
  // };

  // const joinRoom = () => {
  //   if (roomId && userName) {
  //     socket.emit("join", { roomId, userName });
  //   console.log(userName, roomId)
  //   navigate('/code', {
  //     state: { project },
  //   });
  //   }
  // };

  return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Project Dashboard</h1>
          <div className="text-lg font-semibold bg-gray-800 px-4 py-2 rounded-full">
            {userName}
          </div>
        </div>
    
        {/* Main Content */}
        <div className="flex flex-wrap gap-3">
          {/* <button
            className="project p-4 border border-slate-300 rounded-md hover:bg-slate-800"
            onClick={openModal}
          >
            New Project <i className="ri-link pl-2"></i>
          </button> */}

          <button
            className="project p-4 border border-slate-300 rounded-md hover:bg-slate-800"
            onClick={openProject}
          >
            New Project <i className="ri-link pl-2"></i>
          </button>
<div className='w-full'></div>

          {/* {Array.isArray(projects) &&
            projects.map((project) => (
              <div
                key={project._id}
                onClick={() => {
                  navigate('/project', {
                    state: { project },
                  });
                }}
                className="cursor-pointer hover:bg-slate-800 flex flex-col gap-2 project p-2 pl-3 pr-7 border border-slate-300 rounded-md"
              >
                {project.name}{' '}
                <p>
                  {' '}
                  <small>
                    {' '}
                    <i className="ri-user-line"></i> collobrations:{' '}
                  </small>
                  {project.users.length}
                </p>
              </div>
            ))} */}

{Array.isArray(projects) &&
            projects.map((project) => (
              <div
                key={project._id}
                onClick={() => {
                      
                      navigate('/code', {
                      state: { project },
                  });
                }}
                className="cursor-pointer hover:bg-slate-800 flex flex-col gap-2 project p-2 pl-3 pr-7 border border-slate-300 rounded-md"
              >
                {project.name}{' '}
                <p>
                  {' '}
                  <small>
                    {' '}
                    <i className="ri-user-line"></i> collobrations:{' '}
                  </small>
                  {project.users.length}
                </p>
              </div>
            ))}
    
          {/* {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      className="block text-gray-400 mb-2"
                      htmlFor="projectName"
                    >
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="mr-2 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )} */}

{isProjectOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="text"
                      id="roomid"
                      className="w-[266px] mb-2 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a room Id"
                      value={roomId}
                      onChange={handleRoomIdChange}
                    />

                     <button
                      type="button"
                      className="ml-2 py-3  px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                      onClick={createRoomId}
                    >
                      Create Room
                    </button>
                    <input
                      type="text"
                      id="projectName"
                      className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    disabled={!isProjectNameEditable} // Disable input if not editable
                  />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="mr-2 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
                      onClick={closeProject}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      {isProjectNameEditable?"Create":"Join"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  
};

export default Home;