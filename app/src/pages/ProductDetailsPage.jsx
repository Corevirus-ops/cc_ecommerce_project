import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchProductById, clearProductDetails } from '../tools/productDetailsSlice';
import { addCartItem, removeCartItem, updateCartItem } from '../tools/cartSlice';
import './ProductDetailsPage.css';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const product = useSelector(state => state.productDetails.item);
    const status = useSelector(state => state.productDetails.status);
    const error = useSelector(state => state.productDetails.error);
    const user = useSelector(state => state.auth.user);
    const cartActionStatus = useSelector(state => state.cart.actionStatus);
    const cartItem = useSelector(state => state.cart.items.find(item => item.product_id === Number(id)));

    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => {
            dispatch(clearProductDetails());
        };
    }, [dispatch, id]);

    const handleAddToCart = () => {
        if (!user) return;
        dispatch(addCartItem({ productId: product.id, quantity: 1 }));
    };

    const handleDecrease = () => {
        if (cartItem.quantity === 1) {
            dispatch(removeCartItem(cartItem.id));
            return;
        }
        dispatch(updateCartItem({ id: cartItem.id, quantity: cartItem.quantity - 1 }));
    };

    const handleIncrease = () => {
        dispatch(updateCartItem({ id: cartItem.id, quantity: cartItem.quantity + 1 }));
    };

    if (status === 'loading' || status === 'idle') {
        return <main className="product-details-state" role="status">Loading product...</main>;
    }

    if (status === 'failed') {
        return (
            <main className="product-details-state" role="alert">
                <strong>We could not find that product.</strong>
                <span>{error}</span>
                <Link to="/products">Back to products</Link>
            </main>
        );
    }

    return (
        <main className="product-details-page">
            <Link className="product-details-back" to="/products">← Back to products</Link>
            <section className="product-details-panel">
                <div className="product-details-mark" aria-hidden="true">#{String(product.id).padStart(2, '0')}</div>
                <div className="product-details-copy">
                    <p className="product-details-eyebrow">Product details</p>
                    <h1>{product.name}</h1>
                    <p className="product-details-description">
                        {product.description || 'A considered addition to your everyday setup.'}
                    </p>
                    <div className="product-details-purchase">
                        <span className="product-details-price">${Number(product.price || 0).toFixed(2)}</span>
                        {!cartItem ? (
                            <button
                                className="product-details-add"
                                type="button"
                                disabled={!user || cartActionStatus === 'loading'}
                                onClick={handleAddToCart}
                            >
                                {!user ? 'Sign in to add' : cartActionStatus === 'loading' ? 'Adding...' : 'Add to cart'}
                            </button>
                        ) : (
                            <div className="product-details-cart-control">
                                <span className="product-details-cart-count">{cartItem.quantity} in your cart</span>
                                <div className="product-details-quantity" aria-label={`Quantity of ${product.name} in cart`}>
                                    <button type="button" onClick={handleDecrease} disabled={cartActionStatus === 'loading'} aria-label="Decrease quantity">-</button>
                                    <strong>{cartItem.quantity}</strong>
                                    <button type="button" onClick={handleIncrease} disabled={cartActionStatus === 'loading'} aria-label="Increase quantity">+</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}