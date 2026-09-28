
import './App.css'
import {Routes, Route} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getCurrentUser, logout, clearUser } from './tools/auth';
import Register from './pages/Register';
import Login from './pages/Login';

const TestPage = ({user}) => {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logout());
    dispatch(clearUser());

  }
  return (
    <>
    <h1>Welcome {user ? user.username : 'Guest'}</h1>
    {user && <button onClick={handleLogout}>Logout</button>}

    </>
  )
}
function App() {

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  console.log(user);

useEffect(() => {
  if (!user) {
    dispatch(getCurrentUser());
  }
}, [dispatch, user]);



  return (
    <Routes>
      <Route path="/" element={<TestPage user={user} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
