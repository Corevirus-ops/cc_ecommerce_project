import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { checkout, fetchCart, queueQuantityChange } from '../tools/cartSlice';
import './CartPage.css';

export default function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const cartItems = useSelector(state => state.cart.items);
    const cartStatus = useSelector(state => state.cart.status);
    const actionStatus = useSelector(state => state.cart.actionStatus);
    const syncStatus = useSelector(state => state.cart.syncStatus);
    const error = useSelector(state => state.cart.error);

    useEffect(() => {
        if (user && cartStatus === 'idle') dispatch(fetchCart());
    }, [cartStatus, dispatch, user]);

    const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

    if (!user) {
        return (
            <main className="cart-page cart-empty-page">
                <p className="cart-eyebrow">Your provisions</p>
                <h1>Your cart awaits.</h1>
                <p>Sign in to keep your chosen goods close.</p>
                <Link className="cart-primary-link" to="/login">Sign in to continue</Link>
            </main>
        );
    }

    const handleQuantity = (item, quantity) => {
        dispatch(queueQuantityChange({ id: item.id, quantity }));
    };

    const handleCheckout = async () => {
        const result = await dispatch(checkout());
        if (checkout.fulfilled.match(result)) navigate('/');
    };

    return (
        <main className="cart-page">
            <header className="cart-header">
                <div>
                    <p className="cart-eyebrow">Your provisions</p>
                    <h1>The cart.</h1>
                    <p>Everything gathered for the road ahead.</p>
                </div>
                <Link className="cart-back-link" to="/products">Continue gathering</Link>
            </header>

            {cartStatus === 'loading' && <div className="cart-state" role="status">Loading your cart...</div>}
            {cartStatus === 'failed' && <div className="cart-state" role="alert">{error || 'Unable to load your cart.'}</div>}
            {cartStatus === 'succeeded' && cartItems.length === 0 && (
                <div className="cart-state">
                    <strong>Your cart is empty.</strong>
                    <span>The next useful thing may be waiting in the collection.</span>
                    <Link className="cart-primary-link" to="/products">Browse products</Link>
                </div>
            )}
            {cartStatus === 'succeeded' && cartItems.length > 0 && (
                <div className="cart-layout">
                    <ul className="cart-items">
                        {cartItems.map(item => (
                            <li className="cart-item" key={item.id}>
                                <div className="cart-item-number">#{String(item.product_id).padStart(2, '0')}</div>
                                <div className="cart-item-copy">
                                    <h2>{item.name || `Product ${item.product_id}`}</h2>
                                    <p>${Number(item.price || 0).toFixed(2)} each</p>
                                </div>
                                <div className="quantity-control" aria-label={`Quantity for ${item.name || 'product'}`}>
                                    <button type="button" onClick={() => handleQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">-</button>
                                    <span>{item.quantity}</span>
                                    <button type="button" onClick={() => handleQuantity(item, item.quantity + 1)} aria-label="Increase quantity">+</button>
                                </div>
                                <strong className="cart-item-total">${(Number(item.price || 0) * item.quantity).toFixed(2)}</strong>
                                <button className="cart-remove" type="button" onClick={() => dispatch(queueQuantityChange({ id: item.id, quantity: 0 }))}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <aside className="cart-summary">
                        <p className="cart-eyebrow">The tally</p>
                        <div className="cart-total-row"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div>
                        <p className="cart-note">Taxes and delivery are calculated at the final stage of the journey.</p>
                        {error && <p className="cart-error" role="alert">{error}</p>}
                        {syncStatus === 'syncing' && <p className="cart-sync-status">Saving your changes...</p>}
                        {syncStatus === 'failed' && <p className="cart-sync-status" role="alert">Changes will retry shortly.</p>}
                        <button className="cart-checkout" type="button" disabled={actionStatus === 'loading'} onClick={handleCheckout}>
                            {actionStatus === 'loading' ? 'Preparing...' : 'Place the order'}
                        </button>
                    </aside>
                </div>
            )}
        </main>
    );
}