import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { clearSelectedOrder, fetchOrderById } from '../tools/orderSlice';
import './OrderPages.css';

function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function OrderDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedOrder, detailStatus, error } = useSelector(state => state.orders);

    useEffect(() => {
        dispatch(fetchOrderById(id));
        return () => dispatch(clearSelectedOrder());
    }, [dispatch, id]);

    if (detailStatus === 'loading' || detailStatus === 'idle') {
        return <main className="orders-page orders-state" role="status">Opening order record...</main>;
    }

    if (detailStatus === 'failed') {
        return <main className="orders-page orders-state" role="alert"><strong>Order record unavailable.</strong><span>{error}</span><Link to="/orders">Back to order history</Link></main>;
    }

    return (
        <main className="orders-page">
            <Link className="orders-back-link" to="/orders">← Back to order history</Link>
            <section className="order-detail-panel">
                <header className="order-detail-header">
                    <div><p className="orders-eyebrow">Order record</p><h1>#{String(selectedOrder.id).padStart(4, '0')}</h1><p>Placed {formatDate(selectedOrder.created_at)}</p></div>
                    <strong>${Number(selectedOrder.total || 0).toFixed(2)}</strong>
                </header>
                <ul className="order-detail-items">
                    {selectedOrder.items.map(item => (
                        <li key={item.id}><div><strong>{item.productName || `Product ${item.productId}`}</strong><span>{item.quantity} x ${Number(item.price || 0).toFixed(2)}</span></div><strong>${(Number(item.price || 0) * item.quantity).toFixed(2)}</strong></li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
