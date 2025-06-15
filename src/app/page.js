"use client";

import React ,{useState} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
function Page() {
  const [username,setUsername] =useState('')
  const [email,setEmail] = useState('');
  const [password,setPassword] =useState('');
  const router = useRouter();
  const handleSubmit = (e) =>{
    e.preventDefault();
    if(username.trim()=== '' || password.trim() ==='')
    {
      alert('Please fill all details');
    }
    else
    {
       router.push('/components/login');
    }
  }
  return (
    <div className='d-flex min-vh-100 justify-content-center align-items-center'>
      <div className='card' style={{width : '340px'}}>
        <div className='card-body'>
          <h5 className='text-center'>SIGNUP</h5>
          <form onSubmit={handleSubmit}>
            <div className='mb-3'>
              <label className='mb-2'>Username</label>
              <input type='text' className='form-control' value={username} onChange={(e)=> setUsername(e.target.value)}></input>
            </div>
            <div className='mb-3'>
              <label className='mb-2'>Email</label>
              <input type='text' className='form-control' value={email} onChange={(e)=> setEmail(e.target.value)}></input>
            </div>
            <div className='mb-3'>
              <label className='mb-2'>Password</label>
              <input type='password' className='form-control' value={password} onChange={(e)=>setPassword(e.target.value)}></input>
            </div>
            <button type='submit' className='btn btn-success d-flex w-100 justify-content-center'>Signup</button>
          </form>
          <p className='mt-2'>Already have an account? {' '}<Link href='/components/login'>Login</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Page;