import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, logout } from '../tools/auth';
import './Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useSelector(state => state.auth.user);
    const cartItems = useSelector(state => state.cart.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(clearUser());
        closeMenu();
        navigate('/');
    };

    return (
        <header className="site-header">
            <NavLink className="brand-mark" to="/" onClick={closeMenu}>
                <span className="brand-rune" aria-hidden="true">ᛉ</span>
                <span>
                    <strong>CODECADEMY ECOMMERCE PROJECT</strong>
                    <small>Nordic goods for the long road</small>
                </span>
            </NavLink>

            <button
                className="menu-toggle"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="site-navigation"
                onClick={() => setMenuOpen(open => !open)}
            >
                <span className="sr-only">Toggle navigation</span>
                <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            </button>

            <nav id="site-navigation" className={`site-navigation${menuOpen ? ' is-open' : ''}`}>
                <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/products" onClick={closeMenu}>
                    The collection
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? 'nav-link cart-link active' : 'nav-link cart-link'} to="/cart" onClick={closeMenu}>
                    <span>Cart</span>
                    {cartCount > 1 && <span className="cart-badge" aria-label={`${cartCount} items in cart`}>{cartCount}</span>}
                </NavLink>
                {user ? (
                    <>
                        <span className="nav-user">Welcome, {user.username}</span>
                        <button className="nav-action" type="button" onClick={handleLogout}>Leave camp</button>
                    </>
                ) : (
                    <>
                        <NavLink className="nav-link" to="/login" onClick={closeMenu}>Sign in</NavLink>
                        <NavLink className="nav-cta" to="/register" onClick={closeMenu}>Join the clan</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}
