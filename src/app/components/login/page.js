"use client";
import React ,{ useState} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {Button} from 'react-bootstrap';
function Login() {
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const router = useRouter();
    const handleSubmit =(e)=>{
        e.preventDefault();
        if(username.trim() === '' || password.trim() === '')
        {
            alert("Please fill in all details");
        }
        else
        {
            router.push('/components/home');
        }
    };
  return (
    <div className='d-flex min-vh-100 justify-content-center align-items-center'>
        <div className='card' style={{width:'340px'}}>
            <div className='card-body'>
                <h2 className='text-center'>Login</h2>
                <form className='mb-3' onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label className='mb-2'>Username</label>
                        <input type='text' className='form-control' value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div className='mb-3'>
                        <label className='mb-2'>Password</label>
                        <input type='password' className='form-control' value={password} onChange={(e)=>setPassword(e.target.value)}></input>
                    </div>
                    <Button type='submit' className='btn btn-success mt-3 w-100'>
                        Login
                    </Button>
                </form>
                <p> 
                    Don’t have an account ?{' '}
                    <Link href='/'>Signup</Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Login;