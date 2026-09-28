
import './App.css'
import {Routes, Route} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getCurrentUser } from './tools/auth';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductsListingPage from './pages/ProductsListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import Navbar from './components/Navbar';

const HomePage = ({ user }) => {
  return (
    <main className="home-page">
      <div className="home-kicker">A considered collection for the road ahead</div>
      <div className="home-hero-copy">
        <p className="home-mark">R / I</p>
        <h1>Carry less.<br /><em>Choose better.</em></h1>
        <p className="home-description">Tools, objects, and essentials selected for people who build, travel, and keep going.</p>
        <div className="home-actions">
          <a href="/products" className="home-primary-link">Enter the collection <span aria-hidden="true">→</span></a>
          {user ? <span className="home-welcome">Welcome back, {user.username}</span> : <span className="home-welcome">New arrivals, chosen with intent</span>}
        </div>
      </div>
      <div className="home-footer-note"><span>01</span><span>Objects with a story to tell</span><span>Scroll to explore</span></div>
    </main>
  )
}
function App() {

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);



  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductsListingPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Routes>
    </div>
  )
}

export default App
