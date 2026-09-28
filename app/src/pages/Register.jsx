
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { register, setUser, facebookLogin, googleLogin } from '../tools/auth';
import './AuthPage.css';

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

    function handleFacebookLogin() {
        dispatch(facebookLogin()).unwrap()
            .then(result => {
                dispatch(setUser(result.user));
            })
            .catch(error => {
                setError(error.message || 'Unable to login with Facebook');
            });
    }

    function handleGoogleLogin() {
        dispatch(googleLogin()).unwrap()
            .then(result => {
                dispatch(setUser(result.user));
            })
            .catch(error => {
                setError(error.message || 'Unable to login with Google');
            });
    }

        return (
                <main className="auth-page">
                    <section className="auth-panel">
                        <p className="auth-eyebrow">Join the expedition</p>
                        <h1>Make camp here.</h1>
                        <p className="auth-intro">Create an account and keep your chosen goods close.</p>
                        <form className="auth-form" onSubmit={handleSubmit}>
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
                            <button className="auth-submit" type="submit">Join the clan</button>
                            <button className="auth-secondary" type="button" onClick={() => navigate('/login')}>Already have an account</button>
                            <div className="auth-divider"><span>or continue with</span></div>
                            <div className="auth-providers">
                                <button type="button" onClick={handleFacebookLogin}>Facebook</button>
                                <button type="button" onClick={handleGoogleLogin}>Google</button>
                            </div>
                        </form>
                    </section>
                </main>
    );
}