import React, {useContext, useEffect, useState} from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'

const UserAuth = ({children}) => {
    const {user} = useContext(UserContext)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(()=>{
        if(user){
            setLoading(false)
        }
    
        if(!user || !token){
            navigate('/login')
        }
    })
    if(loading){
        return <h1>Loading...</h1>
    }

    return  (
        <>
            {children}
        </>)
}

export default UserAuth