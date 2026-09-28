import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../tools/orderSlice';
import './OrderPages.css';

function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const { orders, status, error } = useSelector(state => state.orders);

    useEffect(() => {
        if (user && status === 'idle') dispatch(fetchOrders());
    }, [dispatch, status, user]);

    if (!user) {
        return <main className="orders-page orders-state"><p className="orders-eyebrow">Your ledger</p><h1>Sign in to see your orders.</h1><Link to="/login">Return to sign in</Link></main>;
    }

    return (
        <main className="orders-page">
            <header className="orders-header">
                <div><p className="orders-eyebrow">Your ledger</p><h1>Order history.</h1><p>Every good chosen, recorded for the road behind.</p></div>
                <Link className="orders-back-link" to="/products">Continue gathering</Link>
            </header>

            {status === 'loading' && <div className="orders-state" role="status">Reading your ledger...</div>}
            {status === 'failed' && <div className="orders-state" role="alert"><strong>We could not load your orders.</strong><span>{error}</span><button type="button" onClick={() => dispatch(fetchOrders())}>Try again</button></div>}
            {status === 'succeeded' && orders.length === 0 && <div className="orders-state"><strong>No orders yet.</strong><span>Your first chapter is waiting in the collection.</span><Link to="/products">Browse products</Link></div>}
            {status === 'succeeded' && orders.length > 0 && (
                <div className="orders-list">
                    {orders.map(order => (
                        <Link className="order-card" to={`/orders/${order.id}`} key={order.id}>
                            <div className="order-card-number">#{String(order.id).padStart(4, '0')}</div>
                            <div className="order-card-main"><p className="order-card-label">Order placed</p><h2>{formatDate(order.created_at)}</h2><span>{order.items.length} {order.items.length === 1 ? 'line item' : 'line items'}</span></div>
                            <strong className="order-card-total">${Number(order.total || 0).toFixed(2)}</strong>
                            <span className="order-card-arrow" aria-hidden="true">→</span>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
