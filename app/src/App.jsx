
import './App.css'
import {Routes, Route} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getCurrentUser } from './tools/auth';

function App() {

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<h1>Hello, World! {user ? user.name : 'Guest'}</h1>} />
    </Routes>
  )
}

export default App
