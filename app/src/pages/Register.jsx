
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { register, setUser } from '../tools/auth';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (form.password !== form.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            const result = await dispatch(register(form)).unwrap();
            dispatch(setUser(result.user));
        } catch (error) {
            setError(error.message || 'Unable to register');
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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={form.username}
                name="username"
                onChange={handleChange}
            />
            <input
                type="email"
                placeholder="Email"
                value={form.email}
                name="email"
                onChange={handleChange}
            />
            <input
                type="password"
                placeholder="Password"
                value={form.password}
                name="password"
                onChange={handleChange}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                name="confirmPassword"
                onChange={handleChange}
            />
            {error && <p role="alert">{error}</p>}
            <button type="submit">Submit</button>
        </form>
    );
}