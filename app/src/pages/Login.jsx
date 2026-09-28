
import {useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, setUser, facebookLogin } from '../tools/auth';

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
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
        <button type="button" onClick={() => navigate('/register')}>Go to Register</button>
        <button type="button" onClick={() => dispatch(facebookLogin())}>Login with Facebook</button>
      </form>
    </div>
  );
}