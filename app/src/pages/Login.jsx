
import {useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, setUser, facebookLogin, googleLogin } from '../tools/auth';
import './AuthPage.css';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const user = useSelector((state) => state.auth.user);

        useEffect(() => {
            if (user) {
                navigate('/');
            }
        }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await dispatch(login(form)).unwrap();
            console.log(result);
            dispatch(setUser(result.user));
        } catch (error) {
            setError(error.message || 'Unable to login');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="auth-eyebrow">Return to the hearth</p>
        <h1>Welcome back.</h1>
        <p className="auth-intro">Sign in to continue your journey through the collection.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email or Username"
          value={form.username}
          name="username"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          name="password"
          onChange={handleChange}
        />
        {error && <p role="alert">{error}</p>}
          <button className="auth-submit" type="submit">Enter the hall</button>
          <button className="auth-secondary" type="button" onClick={() => navigate('/register')}>Create an account</button>
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="auth-providers">
            <button type="button" onClick={() => dispatch(facebookLogin())}>Facebook</button>
            <button type="button" onClick={() => dispatch(googleLogin())}>Google</button>
          </div>
        </form>
      </section>
    </main>
  );
}