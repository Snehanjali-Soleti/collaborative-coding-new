import React, {useState, useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const Register = () => {

    const [email, setEmail] = useState('')
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')


    const navigate = useNavigate();
     const { setUser, setPassError, passError } = useContext(UserContext);

    function submitHandler(e){

        e.preventDefault();

        axios.post('/users/register',{
            userName, email, password
        }).then((res)=>{
            //console.log(res.data)
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user);
            navigate('/')
        }) .catch((error) => {
          console.log(error.response.data);
          // Extract the error message from the response
          const errorMessage = error.response.data?.errors?.[0]?.msg || error.response.data||"An error occurred";
          setPassError(errorMessage); // Set the error message in the state
      });
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <form onSubmit={submitHandler}>
        {passError && (
            <div className="mb-4 text-red-500 text-center">
              {passError}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="userName">UserName</label>
            <input
                 onChange={(e)=>{setUserName(e.target.value)}}
              type="text"
              id="userName"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
                 onChange={(e)=>{setEmail(e.target.value)}}
              type="email"
              id="email"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
                 onChange={(e)=>{setPassword(e.target.value)}}
              type="password"
              id="password"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;